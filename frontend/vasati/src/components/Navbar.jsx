import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Navbar.css";
import "@fontsource/roboto";
import LoginModal from "./LoginModal"; // Import the modal component

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Tracks modal
  // visibility
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginClick = () => {
    setShowLoginModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowLoginModal(false); // Close the modal
  };

  const handleLoginSuccess = (email) => {
    localStorage.setItem("userEmail", email); // Store user email in localStorage
    setIsLoggedIn(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="first">
          <div className="logoholder">
            <button className="logo"></button>
            <h1>NammaVasati</h1>
          </div>

          <ul className="navbar-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">Notifications</Link>
            </li>
            <li>
              <Link to="/myads">My Ads</Link>
            </li>
            <li>
              <Link to="/wishlist">Wishlist</Link>
            </li>
          </ul>
        </div>
        <div className="second">
          <button className="ad" onClick={() => navigate("/advertise")}>
            Advertise
          </button>
          {isLoggedIn ? (
            <button className="pro">Profile</button>
          ) : (
            <button className="login" onClick={handleLoginClick}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Render the Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseModal}
          onLoginSuccess={(email) => handleLoginSuccess(email)}
        />
      )}
    </>
  );
}

export default Navbar;
