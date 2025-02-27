import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Navbar from "./Navbar"; // Ensure Navbar is imported correctly
import Footer from "./Footer";

function Wishlist() {
  return (
    <div className="wish-container">
      <Navbar />
      <h1>Welcome to wishlist</h1>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Wishlist; // Ensure this line exists
