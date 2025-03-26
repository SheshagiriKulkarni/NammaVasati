import React, { useState, useEffect } from "react";
import { Lock, Mail, CheckCircle, XCircle } from "lucide-react";
import "./ResetPasswordPage.css";

// Success Page Component
const PasswordResetSuccessPage = () => {
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f4f4f4",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      padding: "30px",
      textAlign: "center",
      maxWidth: "400px",
      width: "100%",
    },
    icon: {
      color: "#4CAF50",
      marginBottom: "20px",
    },
    title: {
      color: "#333",
      marginBottom: "15px",
    },
    message: {
      color: "#666",
      marginBottom: "20px",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "10px",
    },
    button: {
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    closeButton: {
      backgroundColor: "#4CAF50",
      color: "white",
    },
    loginButton: {
      backgroundColor: "#2196F3",
      color: "white",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <CheckCircle size={80} style={styles.icon} />
        <h1 style={styles.title}>Password Successfully Updated</h1>
        <p style={styles.message}>
          Your password has been successfully changed. You can now log in with
          your new password.
        </p>
        <div style={styles.buttonContainer}>
          <button
            style={{ ...styles.button, ...styles.closeButton }}
            onClick={() => window.close()}
          >
            Close Window
          </button>
          <a
            href="/login"
            style={{
              ...styles.button,
              ...styles.loginButton,
              textDecoration: "none",
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
};

// Failure Page Component
const PasswordResetFailurePage = ({ errorMessage }) => {
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f4f4f4",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      padding: "30px",
      textAlign: "center",
      maxWidth: "400px",
      width: "100%",
    },
    icon: {
      color: "#FF5722",
      marginBottom: "20px",
    },
    title: {
      color: "#333",
      marginBottom: "15px",
    },
    message: {
      color: "#666",
      marginBottom: "20px",
    },
    errorList: {
      listStyle: "disc",
      textAlign: "left",
      paddingLeft: "20px",
      color: "#666",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "10px",
    },
    button: {
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    closeButton: {
      backgroundColor: "#FF5722",
      color: "white",
    },
    retryButton: {
      backgroundColor: "#2196F3",
      color: "white",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <XCircle size={80} style={styles.icon} />
        <h1 style={styles.title}>Password Reset Failed</h1>
        <p style={styles.message}>
          We could not reset your password.
          {errorMessage && <div>Error: {errorMessage}</div>}
        </p>
        <ul style={styles.errorList}>
          <li>Expired reset link</li>
          <li>Invalid token</li>
          <li>Server error</li>
        </ul>
        <div style={styles.buttonContainer}>
          <button
            style={{ ...styles.button, ...styles.closeButton }}
            onClick={() => window.close()}
          >
            Close Window
          </button>
          <a
            href="/forgot-password"
            style={{
              ...styles.button,
              ...styles.retryButton,
              textDecoration: "none",
            }}
          >
            Request New Link
          </a>
        </div>
      </div>
    </div>
  );
};

// Main Reset Password Component
const ResetPasswordPage = () => {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get("email");
    const resetToken = urlParams.get("token");

    if (emailFromUrl) {
      setUserEmail(decodeURIComponent(emailFromUrl));
    }

    if (resetToken) {
      console.log("Reset token received:", resetToken);
    }
  }, []);

  const validatePassword = (pass) => {
    const errors = [];

    if (pass.length < 8) {
      errors.push("Must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(pass)) {
      errors.push("Must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(pass)) {
      errors.push("Must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(pass)) {
      errors.push("Must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      errors.push("Must contain at least one special character");
    }

    return errors;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordErrors(validatePassword(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (passwordErrors.length > 0) {
      alert("Please fix password errors before submitting");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");

    try {
      const response = await fetch(
        "http://localhost:5000/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            newPassword: password,
            token: resetToken,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatus("success");
      } else {
        setStatus("failure");
        setErrorMessage(data.message || "Password reset failed");
      }
    } catch (err) {
      setStatus("failure");
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  // Render status pages if status is set
  if (status === "success") {
    return <PasswordResetSuccessPage />;
  }

  if (status === "failure") {
    return <PasswordResetFailurePage errorMessage={errorMessage} />;
  }

  // Regular reset password form
  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-password-title">Reset Your Password</h2>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                id="email"
                value={userEmail}
                readOnly
                className="form-input email-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Password Rules Section */}
          <div className="password-requirements">
            <h3 className="requirements-title">Password Requirements:</h3>
            <ul className="requirements-list">
              {[
                "At least 8 characters long",
                "Contains an uppercase letter",
                "Contains a lowercase letter",
                "Contains a number",
                "Contains a special character",
              ].map((rule, index) => (
                <li
                  key={index}
                  className={`requirement-item ${
                    passwordErrors.some((err) =>
                      err.includes(rule.split(" ")[2])
                    )
                      ? "error"
                      : "valid"
                  }`}
                >
                  {passwordErrors.some((err) =>
                    err.includes(rule.split(" ")[2])
                  ) ? (
                    <XCircle size={16} className="requirement-icon" />
                  ) : (
                    <CheckCircle size={16} className="requirement-icon" />
                  )}
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
