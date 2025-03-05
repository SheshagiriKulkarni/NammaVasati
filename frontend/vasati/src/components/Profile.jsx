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
  const [imageUrl, setImageUrl] = useState(null); // Store the image URL from the backend
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  const [pgs, setPgs] = useState([]);

  const userEmail = localStorage.getItem("userEmail");
  const [mobileNumber, setMobileNumber] = useState("9353722418");
  const [isEditing, setIsEditing] = useState(false);
  const [editedMobileNumber, setEditedMobileNumber] = useState("");

  const handleEditMobile = () => {
    setEditedMobileNumber(mobileNumber);
    setIsEditing(true);
  };

  useEffect(() => {
    const fetchMobileNumber = async () => {
      if (!userEmail) {
        alert("User email not found. Please log in.");
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/auth/getMobileNumber/${userEmail}`
        );

        // Set mobile number, default to empty string if null
        setMobileNumber(response.data.mobileNumber || "");
      } catch (error) {
        console.error("Error fetching mobile number:", error);
        // Optionally set a default or handle the error
        setMobileNumber("");
      }
    };

    fetchMobileNumber();
  }, [userEmail, navigate]);

  const handleSaveMobile = async () => {
    // Validate mobile number (you can add more robust validation)
    if (editedMobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      // Assuming you have an API endpoint to update mobile number
      const userEmail = localStorage.getItem("userEmail");
      const response = await axios.post(
        "http://localhost:5000/auth/updateMobileNumber",
        {
          email: userEmail,
          mobileNumber: editedMobileNumber,
        }
      );

      // Update local state if API call is successful
      setMobileNumber(response.data.mobileNumber);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating mobile number:", error);
      alert("Failed to update mobile number");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedMobileNumber(mobileNumber);
  };

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/auth/profileImage/${userEmail}`,
        {
          responseType: "blob",
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      setImageUrl(imageUrl);
      console.log("Fetched image URL:", imageUrl);
    } catch (error) {
      console.error("Error fetching profile image:", error);
      // Set a default image or handle the error state
      setImageUrl("/path/to/default/profile/image.png"); // Replace with your default image path
    }
  };

  useEffect(() => {
    if (userEmail) fetchProfileImage();
  }, [userEmail]);
  const handleClick = () => {
    fileInputRef.current.click();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("Please select an image");
    }

    setImage(Object.assign(file, { preview: URL.createObjectURL(file) }));

    const formData = new FormData();
    formData.append("image", file);
    formData.append("email", userEmail);

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/uploadProfileImage",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log(response.data);

      if (response.data.filename) {
        fetchProfileImage(userEmail);
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
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

  const handleAdClick = (adId) => {
    console.log(adId);
    navigate(`/addetails/${adId}`); // Navigates to the ad's page
  };

  return (
    <div className="prof-container">
      <Navbar />
      <div className="box-container">
        <div className="main-cont">
          <div className="left-cont">
            <div className="image-conta">
              <div className="image-field">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                  ref={fileInputRef}
                  style={{ display: "none" }} // Hide the input field
                />
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile Preview"
                    className="preview-image"
                  />
                ) : (
                  <div className="placeholder" onClick={handleClick}>
                    +
                  </div>
                )}

                <button className="edit-image-btn" onClick={triggerFileInput}>
                  ✎
                </button>
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
            <div className="ed-mob">
              <div className="mob-no">
                {!isEditing ? (
                  <>
                    <p className="mob-p">Mobile Number&nbsp;:</p>
                    <p className="mob">
                      {mobileNumber || "No mobile number added"}
                    </p>
                    {mobileNumber && (
                      <button
                        className="edit-mobile-btn"
                        onClick={handleEditMobile}
                      >
                        ✎
                      </button>
                    )}
                  </>
                ) : (
                  <div className="mobile-edit-container">
                    <input
                      type="tel"
                      value={editedMobileNumber}
                      onChange={(e) => setEditedMobileNumber(e.target.value)}
                      className="mobile-edit-input"
                      maxLength="10"
                      placeholder="Enter mobile number"
                    />
                    <div className="mobile-edit-actions">
                      <button
                        className="save-mobile-btn"
                        onClick={handleSaveMobile}
                      >
                        OK
                      </button>
                      <button
                        className="cancel-mobile-btn"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="ads">
              <h2 className="head">Ads Posted By You&nbsp;:</h2>
              <ol>
                {pgs.map((pg, index) => (
                  <li key={index} className="li-items">
                    <span onClick={() => handleAdClick(pg._id)}>
                      {pg.pgName}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="post-ad">
              <p className="first-p">
                <span className="para">To Post an Ad Click Here 👉</span>
                <span>: </span>
                <span className="post" onClick={() => navigate("/advertise")}>
                  Post Now
                </span>
              </p>
            </div>

            <div className="post-ad">
              <p>
                <span className="para">Find Your Favourite PG Here 👉</span>
                <span>: </span>
                <span
                  className="post"
                  onClick={() => navigate("/AllAddetails")}
                >
                  Find Now
                </span>
              </p>
            </div>

            <div className="post-ad">
              <p>
                <span className="para">Check New Messages Here 👉</span>
                <span>: </span>
                <span className="post">Find Now</span>
              </p>
            </div>

            <div className="outer-btns">
              <button className="in-btns" onClick={() => navigate("/myads")}>
                My Ads
              </button>

              <button className="in-btns" onClick={() => navigate("/wishlist")}>
                Wishlist
              </button>
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
