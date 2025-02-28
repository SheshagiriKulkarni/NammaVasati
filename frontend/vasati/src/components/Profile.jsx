import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Navbar from "./Navbar"; // Ensure Navbar is imported correctly
import Footer from "./Footer";
import "./Profile.css";

function Profile() {
  return (
    <div className="prof-container">
      <Navbar />
      <div className="box-container">
        <div className="main-cont">
          <div className="left-cont"></div>
          <div className="right-cont"></div>
        </div>
      </div>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Profile; // Ensure this line exists
