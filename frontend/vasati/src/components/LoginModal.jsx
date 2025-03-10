import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LoginModal.css";
import { useNavigate } from "react-router-dom";

import {
  auth,
  provider,
  signInWithPopup,
  githubProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  GithubAuthProvider,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from "./Firebase";

import { getAuth } from "firebase/auth";

function LoginModal({ onClose, onLoginSuccess }) {
  // State for email, password, and whether it's login or signup form
  const [email, setEmail] = useState("");
  const [SupEmail, setSupEmail] = useState("");
  const [password, setPassword] = useState("");
  const [SupPassword, setSupPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  // form
  const [rememberMe, setRememberMe] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Auth is:", auth);
    console.log("Provider is:", provider);
  }, []);
  // Handle form submission

  useEffect(() => {
    const saved = localStorage.getItem("savedCredentials");
    if (saved) {
      setSavedCredentials(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const lastUsed = localStorage.getItem("lastUsedCredentials");
    if (lastUsed) {
      const { email: savedEmail, password: savedPassword } =
        JSON.parse(lastUsed);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      console.log("I am called");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userEmail = user.email;
      console.log("User signed in with email:", userEmail);

      // You can store just the email if that's what you need
      localStorage.setItem("userEmail", userEmail);

      // After successful Google sign-in, check if GitHub linking is possible
      const shouldLinkGithub = window.confirm(
        "Would you like to connect your GitHub account as well? " +
          "This will allow you to sign in with either method."
      );

      if (shouldLinkGithub) {
        try {
          // Try GitHub sign-in to link accounts
          const githubResult = await signInWithPopup(auth, githubProvider);

          // If we get here, the GitHub account was successfully linked
          alert("Successfully connected your GitHub account!");
        } catch (githubError) {
          if (githubError.code === "auth/credential-already-in-use") {
            // This GitHub account is already linked to another account
            alert(
              "This GitHub account is already connected to a different email address. Please try another GitHub account or continue without linking."
            );
          } else if (githubError.code === "auth/provider-already-linked") {
            alert("Your GitHub account is already connected!");
          } else {
            console.error("GitHub linking error:", githubError);
            alert("Error connecting GitHub account: " + githubError.message);
          }
        }
      }

      localStorage.setItem("user", JSON.stringify(user));
      onLoginSuccess(userEmail);
      onClose(); // Close the modal after login
      window.location.reload();
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert("Google sign-in failed: " + error.message);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (error) {
      console.log("Full error details:", error);

      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email;
        console.log("Conflicting email:", email);

        const shouldTryGoogle = window.confirm(
          `An account with ${email} already exists with Google. Would you like to sign in with Google and connect your GitHub account?`
        );

        if (shouldTryGoogle) {
          try {
            // Sign in with Google
            const googleResult = await signInWithPopup(auth, provider);

            // After Google sign-in, try to link the GitHub account
            try {
              const pendingGithubCred =
                GithubAuthProvider.credentialFromError(error);
              if (pendingGithubCred) {
                await linkWithCredential(googleResult.user, pendingGithubCred);
                alert(
                  "Successfully connected your GitHub account! You can now use either method to sign in."
                );
              }
            } catch (linkError) {
              if (linkError.code === "auth/provider-already-linked") {
                alert("Your accounts are already connected!");
              } else {
                console.error("Linking error:", linkError);
                alert("Error connecting accounts: " + linkError.message);
              }
            }

            localStorage.setItem("user", JSON.stringify(googleResult.user));
            onLoginSuccess(user);
            onClose(); // Close the modal after login
            window.location.reload();
          } catch (googleError) {
            console.error("Google sign-in error:", googleError);
            alert("Error signing in with Google: " + googleError.message);
          }
        }
      } else {
        console.error("GitHub Sign-In Error:", error);
        alert("Error signing in with GitHub: " + error.message);
      }
    }
  };

  const saveCredentials = (email, password) => {
    const credentials = {
      email,
      password,
      timestamp: new Date().toISOString(),
    };

    // Get existing credentials
    const existing = JSON.parse(
      localStorage.getItem("savedCredentials") || "[]"
    );

    // Check if email already exists
    const emailExists = existing.findIndex((cred) => cred.email === email);

    if (emailExists >= 0) {
      // Update existing entry
      existing[emailExists] = credentials;
    } else {
      // Add new entry
      existing.push(credentials);
    }

    // Keep only the last 5 entries
    const latest = existing
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    localStorage.setItem("savedCredentials", JSON.stringify(latest));
    localStorage.setItem("lastUsedCredentials", JSON.stringify(credentials));
    setSavedCredentials(latest);
  };

  // Add this function that's referenced when clicking on a saved credential
  const handleCredentialSelect = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (isLogin && (!email || !password)) {
      alert("Please fill in both fields.");
      return;
    }

    if (!isLogin && (!SupEmail || !SupPassword)) {
      alert("Please fill in both fields.");
      return;
    }

    try {
      let response;
      if (isLogin) {
        // Login request
        response = await axios.post("http://localhost:5000/auth/login", {
          email,
          password,
        });
      } else {
        // Signup request
        response = await axios.post("http://localhost:5000/auth/signup", {
          SupEmail,
          mobileNumber,
          SupPassword,
        });
      }

      if (response.status === 201 && !isLogin) {
        // Signup successful
        alert("Signup successful!");
        onLoginSuccess(email); // Call the callback function to update the Navbar state
        onClose(); // Close the modal after login
      } else if (response.data.token) {
        // Login successful
        alert("Login successful!");
        if (rememberMe) {
          saveCredentials(email, password);
        } else {
          // Clear last used credentials if remember me is not checked
          localStorage.removeItem("lastUsedCredentials");
        }
        localStorage.setItem("authToken", response.data.token); // Save the token to localStorage
        onLoginSuccess(email); // Call the callback function to update the Navbar state
        onClose(); // Close the modal after login
        window.location.reload();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          `${isLogin ? "Login" : "Signup"} failed`
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="form-group">
          <div className="logo-sup">
            <img
              src="https://cdn-icons-png.freepik.com/512/48/48863.png"
              alt=""
              className="nv-img"
            />
            <div
              className="sup-btn"
              onClick={() => setIsLogin(!isLogin)} // Toggle between login and signup
            >
              {isLogin ? (
                <>
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 640 512"
                    class="scan-icon"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M624 208h-64v-64c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v64h-64c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h64v64c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-64h64c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm-400 48c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path>
                  </svg>
                  Sign Up
                </>
              ) : (
                <>
                  <img
                    alt=""
                    src="https://icons.veryicon.com/png/o/miscellaneous/esgcc-basic-icon-library/1-login.png"
                  />
                  Sign In
                </>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {isLogin && (
              <div className="email-class">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Update state on input change
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder="Enter Your Email Address"
                  className="input"
                />
                {showSuggestions && savedCredentials.length > 0 && (
                  <div className="suggestions-dropdown">
                    {savedCredentials.map((cred, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleCredentialSelect(cred)}
                      >
                        <span className="suggestion-icon">👤</span>
                        <span>{cred.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isLogin && (
              <input
                type="email"
                id="email"
                value={SupEmail}
                onChange={(e) => setSupEmail(e.target.value)} // Update state on input change
                placeholder="Enter Your Email Address"
                className="input"
              />
            )}

            {!isLogin && (
              <input
                type="number"
                id="number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter Your Phone Number"
                className="input"
              />
            )}
            {isLogin && (
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update state on input change
                placeholder="Enter Your Password"
                className="input"
              />
            )}

            {!isLogin && (
              <input
                type="password"
                id="password"
                value={SupPassword}
                onChange={(e) => setSupPassword(e.target.value)} // Update state on input change
                placeholder="Enter Your Password"
                className="input"
              />
            )}

            {isLogin && (
              <div className="fp-cont">
                <div className="cb-cont">
                  <input
                    type="checkbox"
                    className="cb"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember Me
                </div>
                <div className="fp">Forgot Password?</div>
              </div>
            )}

            {!isLogin && (
              <div className="terms-div">
                <input type="checkbox" id="remember" name="remember" />
                <p className="agree">
                  I agree to <span>Terms & Conditions</span>.
                </p>
              </div>
            )}

            <button type="submit" className="login-submit">
              {isLogin ? "Login" : "Sign up"}
            </button>
          </form>

          {isLogin && (
            <div className="or-cont">
              <div className="hr"></div>
              <p>or</p>
              <div className="hr"></div>
            </div>
          )}

          {isLogin && (
            <div className="alt-signins">
              {/* <p>Sign in using</p> */}
              <div
                className="alt-btns"
                onClick={() => {
                  console.log("Google button clicked");
                  handleGoogleSignIn();
                }}
              >
                <p className="goo">Google</p>
                <div className="google sp-btns">
                  <img
                    src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                    alt=""
                  />
                </div>
              </div>

              <div className="alt-btns">
                <p className="goo">GitHub</p>
                <div className="google sp-btns" onClick={handleGitHubSignIn}>
                  <img
                    src="https://e7.pngegg.com/pngimages/678/920/png-clipart-github-computer-icons-gitlab-github-cdr-white.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          )}

          <div className="tc">
            I accept that I have read & understood your{" "}
            <span>Privacy Policy</span> and <span>T&Cs</span>.
          </div>

          {/* Toggle between login and signup */}
        </div>

        <div className="login-img"></div>
      </div>
    </div>
  );
}

export default LoginModal;
