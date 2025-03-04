import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Navbar from "./Navbar"; // Ensure Navbar is imported correctly
import Footer from "./Footer";
import "./Profile.css";

function Profile() {
  const [image, setImage] = useState(null);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  const [pgs, setPgs] = useState([]);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(Object.assign(file, { preview: URL.createObjectURL(file) }));
    }
  };

  useEffect(() => {
    const fetchPgDetails = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("User email not found. Please log in.");
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/advertise/myads?email=${userEmail}`
        );
        setPgs(response.data);
        console.log(pgs);
      } catch (error) {
        console.error("Error fetching PG details:", error);
      }
    };

    fetchPgDetails();
  }, [navigate]);

  return (
    <div className="prof-container">
      <Navbar />
      <div className="box-container">
        <div className="main-cont">
          <div className="left-cont">
            <div className="image-conta">
              <div className="image-field" onClick={handleClick}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                  ref={fileInputRef}
                  style={{ display: "none" }} // Hide the input field
                />
                {image ? (
                  <img
                    src={image.preview}
                    alt="Profile Preview"
                    className="preview-image"
                  />
                ) : (
                  <div className="placeholder">+</div>
                )}
              </div>
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
          <div className="right-cont">
            <div className="mob-no">
              <p className="mob-p">Mobile Number&nbsp;:</p>
              <p className="mob">9353722418</p>
            </div>

            <div className="ads">
              <h2 className="head">Ads Posted By You&nbsp;:</h2>
              <ol>
                {pgs.map((pg, index) => (
                  <li key={index} className="li-items">
                    <span>{pg.pgName}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="post-ad">
              <p>
                To Post an Ad Click Here 👉 :{" "}
                <span className="post">Post Now</span>
              </p>
            </div>

            <div className="outer-btns">
              <div className="user-ads">
                <button>My Ads</button>
              </div>

              <div className="user-ads">
                <button>Wishlist</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Profile; // Ensure this line exists
