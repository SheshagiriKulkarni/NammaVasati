import React, { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Navbar.css";
import "@fontsource/roboto";
import LoginModal from "./LoginModal"; // Import the modal component

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Tracks modal
  // visibility
  const [menuOpen, setMenuOpen] = useState(false); // Hamburger menu state
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "active-link" : "");

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

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>

          <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
            <li>
              <Link
                to="/"
                className={isActive("/")}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/chatList"
                className={isActive("/chatList")}
                onClick={() => setMenuOpen(false)}
              >
                Messages
              </Link>
            </li>
            <li>
              {localStorage.getItem("userEmail") ? (
                <Link
                  to="/myads"
                  className={isActive("/myads")}
                  onClick={() => setMenuOpen(false)}
                >
                  My Ads
                </Link>
              ) : (
                <Link
                  to="#"
                  onClick={() => alert("Please log in to access My Ads")}
                >
                  My Ads
                </Link>
              )}
            </li>
            <li>
              <Link
                to="/wishlist"
                className={isActive("/wishlist")}
                onClick={() => setMenuOpen(false)}
              >
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        <div className="second">
          <button className="ad" onClick={() => navigate("/advertise")}>
            Advertise
          </button>
          {isLoggedIn ? (
            <button className="pro" onClick={() => navigate("/profile")}>
              Profile
            </button>
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
