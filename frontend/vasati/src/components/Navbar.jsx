import React, { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Navbar.css";
import "@fontsource/roboto";
import LoginModal from "./LoginModal"; // Import the modal component
// Import icons from a library like react-icons
import { AiFillHome, AiOutlineMessage, AiOutlineHeart } from "react-icons/ai";
import { BsFillFileEarmarkPostFill, BsFillPersonFill } from "react-icons/bs";
import { MdOutlineLogout, MdLogin } from "react-icons/md";
import { FaAd } from "react-icons/fa";

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
    setMenuOpen(false);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false); // Close the modal
  };

  const handleLoginSuccess = (email) => {
    localStorage.setItem("userEmail", email); // Store user email in localStorage
    setIsLoggedIn(true);
  };

  const handleLogOut = () => {
    // Clear all authentication-related items from localStorage
    localStorage.removeItem("userEmail");
    localStorage.removeItem("authToken");
    localStorage.removeItem("wishlist");
    // Add any other items that need to be cleared

    // Optional: Show a logout message
    alert("Logged out successfully");
    setMenuOpen(false);

    window.location.reload();

    // Redirect to the login page or home page
    navigate("/"); // or navigate("/") for home page
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
                <AiFillHome className="nav-icon" /> Home
              </Link>
            </li>
            <li>
              <Link
                to="/chatList"
                className={isActive("/chatList")}
                onClick={() => setMenuOpen(false)}
              >
                <AiOutlineMessage className="nav-icon" /> Messages
              </Link>
            </li>
            <li>
              <Link
                to="/myads"
                className={isActive("/myads")}
                onClick={() => setMenuOpen(false)}
              >
                <BsFillFileEarmarkPostFill className="nav-icon" /> My Ads
              </Link>
            </li>
            <li>
              <Link
                to="/wishlist"
                className={isActive("/wishlist")}
                onClick={() => setMenuOpen(false)}
              >
                <AiOutlineHeart className="nav-icon" /> Wishlist
              </Link>
            </li>

            <li className="spe-li">
              <Link
                to="/advertise"
                className={isActive("/advertise")}
                onClick={() => setMenuOpen(false)}
              >
                <FaAd className="nav-icon" /> Advertise
              </Link>
            </li>
            {isLoggedIn ? (
              <>
                <li className="spe-li">
                  <Link
                    to="/profile"
                    className={isActive("/profile")}
                    onClick={() => setMenuOpen(false)}
                  >
                    <BsFillPersonFill className="nav-icon" /> Profile
                  </Link>
                </li>
                <li className="spe-li">
                  <Link className={isActive("/logout")} onClick={handleLogOut}>
                    <MdOutlineLogout className="nav-icon" /> Logout
                  </Link>
                </li>
              </>
            ) : (
              <li className="spe-li">
                <Link onClick={handleLoginClick} className={isActive("/login")}>
                  <MdLogin className="nav-icon" /> Login
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="second">
          <button className="ad" onClick={() => navigate("/advertise")}>
            <FaAd className="nav-icon" /> Advertise
          </button>
          {isLoggedIn ? (
            <button className="pro" onClick={() => navigate("/profile")}>
              <BsFillPersonFill className="nav-icon" /> Profile
            </button>
          ) : (
            <button className="login" onClick={handleLoginClick}>
              <MdLogin className="nav-icon" /> Login
            </button>
          )}

          {isLoggedIn && (
            <button className="logout" onClick={handleLogOut}>
              <MdOutlineLogout className="nav-icon" /> Logout
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
