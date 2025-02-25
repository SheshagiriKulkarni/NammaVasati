import React, { useState } from "react";
import axios from "axios";
import "./LoginModal.css";

function LoginModal({ onClose, onLoginSuccess }) {
  // State for email, password, and whether it's login or signup form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup form

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!email || !password) {
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
          email,
          password,
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
        localStorage.setItem("authToken", response.data.token); // Save the token to localStorage
        onLoginSuccess(email); // Call the callback function to update the Navbar state
        onClose(); // Close the modal after login
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
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state on input change
              placeholder="Enter your email..."
            />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update state on input change
              placeholder="Enter your password..."
            />
            <button type="submit" className="login-submit">
              {isLogin ? "Login" : "Sign up"}
            </button>
          </form>

          {/* Toggle between login and signup */}
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              onClick={() => setIsLogin(!isLogin)} // Toggle between login and signup
              className="toggle-link"
            >
              {isLogin ? "Sign up here" : "Login here"}
            </span>
          </p>
        </div>

        <div className="login-img"></div>
      </div>
    </div>
  );
}

export default LoginModal;
