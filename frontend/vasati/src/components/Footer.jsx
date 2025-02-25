import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css"; // Create this file for styling if needed

function Footer() {
  return (
    <div className="foot-container">
      <div className="homefast">
        <h3>Home Fast</h3>
        <Link to="#">About Us</Link>
        <Link to="#">Our Awards</Link>
        <Link to="#">Corporate Materials</Link>
        <Link to="#">Advertisement</Link>
      </div>
      <div className="services">
        <h3>Our Services</h3>
        <Link to="#">About Us</Link>
        <Link to="#">Our Awards</Link>
        <Link to="#">Corporate Materials</Link>
        <Link to="#">Advertisement</Link>
      </div>
      <div className="other">
        <h3>Others</h3>
        <Link to="#">About Us</Link>
        <Link to="#">Our Awards</Link>
        <Link to="#">Corporate Materials</Link>
        <Link to="#">Advertisement</Link>
      </div>
    </div>
  );
}

export default Footer;
