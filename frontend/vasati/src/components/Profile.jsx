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
          <div className="left-cont">
            <div className="image-conta">
              <div className="image-field"></div>
            </div>
            <div className="email-cont">
              <div className="email">
                Email: {localStorage.getItem("userEmail") || "No Email Found"}
              </div>
            </div>

            <div className="date-cont">
              <div className="date">Joined Date: 28-02-2025</div>
            </div>

            <div className="btns">
              <button>
                Ads Posted : <span>5</span>
              </button>
              <button>
                Total Veiws : <span>15</span>
              </button>
            </div>
          </div>
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
