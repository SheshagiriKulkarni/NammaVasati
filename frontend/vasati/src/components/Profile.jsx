import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Profile.css";

function Profile() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  const [pgs, setPgs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userEmail = localStorage.getItem("userEmail");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedMobileNumber, setEditedMobileNumber] = useState("");

  // New state variables for additional fields
  const [accountType, setAccountType] = useState("Standard");
  const [isAccountActive, setIsAccountActive] = useState(true);
  const [lastActive, setLastActive] = useState("Today");
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    newMessages: true,
    adResponses: true,
    promotions: false,
  });
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });
  const [userBadges, setUserBadges] = useState([
    { name: "Verified", icon: "✓" },
    { name: "Top Poster", icon: "🏆" },
  ]);
  console.log(imageUrl);

  const handleEditMobile = () => {
    setEditedMobileNumber(mobileNumber);
    setIsEditing(true);
  };

  const handleDelete = async (adId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this ad?"
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/advertise/${adId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the ad");
      }

      alert("Ad deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting ad:", error);
      alert("Failed to delete the ad. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) {
        alert("User email not found. Please log in.");
        navigate("/");
        return;
      }

      setIsLoading(true);
      try {
        // Fetch mobile number
        const response = await axios.get(
          `http://localhost:5000/auth/getMobileNumber/${userEmail}`
        );
        setMobileNumber(response.data.mobileNumber || "");

        // In a real app, you would fetch these from your API
        // For now, we're just setting them with mock data
        setAccountType("Premium");
        setIsAccountActive(true);
        setLastActive("Today at 2:45 PM");

        // Simulating API delay
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMobileNumber("");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userEmail, navigate]);

  const handleSaveMobile = async () => {
    if (editedMobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/updateMobileNumber",
        {
          email: userEmail,
          mobileNumber: editedMobileNumber,
        }
      );

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
    } catch (error) {
      console.error("Error fetching profile image:", error);
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
      return;
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

      if (response.data.filename) {
        fetchProfileImage();
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
  };

  useEffect(() => {
    const fetchPgDetails = async () => {
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
      } catch (error) {
        console.error("Error fetching PG details:", error);
      }
    };

    fetchPgDetails();
  }, [navigate]);

  const handleAdClick = (adId) => {
    navigate(`/addetails/${adId}`);
  };

  // New function to handle notification setting changes
  const handleNotificationChange = (setting) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // New function to handle account upgrade
  const handleUpgradeAccount = () => {
    // In a real app, this would navigate to a payment/upgrade page
    alert("This would navigate to the account upgrade page");
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
                  style={{ display: "none" }}
                />

                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="Profile Preview"
                      className="preview-image"
                    />
                    <button
                      className="edit-image-btn"
                      onClick={triggerFileInput}
                    >
                      ✎
                    </button>
                  </>
                ) : (
                  <div className="placeholder" onClick={handleClick}>
                    +
                  </div>
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
                Ads Posted <span>{pgs.length || 0}</span>
              </button>
              <button>
                Total Views <span>15</span>
              </button>
            </div>

            {/* New User Badges Section */}
            <div className="user-badges">
              <h3>User Badges</h3>
              <div className="badges-container">
                {userBadges.map((badge, index) => (
                  <div key={index} className="badge">
                    <span className="badge-icon">{badge.icon}</span>
                    {badge.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="right-cont">
            {/* New Account Status Section */}
            <div className="user-status">
              <div className="status-header">
                <div className="status-title">Account Status</div>
                <div
                  className={`status-indicator ${
                    !isAccountActive ? "inactive" : ""
                  }`}
                >
                  {isAccountActive ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="account-type">
                <div className="account-label">Account Type</div>
                <div className="account-value">{accountType}</div>
              </div>
              {accountType === "Standard" && (
                <button className="upgrade-btn" onClick={handleUpgradeAccount}>
                  Upgrade to Premium
                </button>
              )}
              <div className="last-active">Last seen: {lastActive}</div>
            </div>

            <div className="ed-mob">
              <div className="mob-no">
                {!isEditing ? (
                  <>
                    <p className="mob-p">Mobile Number:</p>
                    <p className="mob">
                      {isLoading ? (
                        <span
                          className="loading"
                          style={{ width: "120px", height: "20px" }}
                        ></span>
                      ) : (
                        mobileNumber || "No mobile number added"
                      )}
                    </p>
                    {mobileNumber && !isLoading && (
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
              <h2 className="head">Ads Posted By You:</h2>
              {isLoading ? (
                [...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="li-items loading"
                    style={{ height: "50px" }}
                  ></div>
                ))
              ) : pgs.length > 0 ? (
                <ol>
                  {pgs.map((pg, index) => (
                    <li key={index} className="li-items">
                      <div className="pg-listing-container">
                        <span
                          className="pg-names"
                          onClick={() => handleAdClick(pg._id)}
                        >
                          {pg.pgName}
                        </span>
                        <div className="pg-actions">
                          <span
                            className="edit-symbol"
                            onClick={() => navigate(`/edit-ad/${pg._id}`)}
                          >
                            ✎
                          </span>
                          <span
                            className="delete-symbol"
                            onClick={() => handleDelete(pg._id)}
                          >
                            🗑️
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>You haven't posted any ads yet.</p>
              )}
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
                <span className="post" onClick={() => navigate("/messages")}>
                  Find Now
                </span>
              </p>
            </div>

            {/* New Notification Settings Section */}
            <div className="notification-settings">
              <h3 className="notification-title">Notification Settings</h3>
              <div className="notification-options">
                <div className="notification-option">
                  <span className="option-label">Email Alerts</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailAlerts}
                      onChange={() => handleNotificationChange("emailAlerts")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <span className="option-label">New Messages</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.newMessages}
                      onChange={() => handleNotificationChange("newMessages")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <span className="option-label">Ad Responses</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.adResponses}
                      onChange={() => handleNotificationChange("adResponses")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <span className="option-label">Promotional Updates</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.promotions}
                      onChange={() => handleNotificationChange("promotions")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* New Social Connect Section */}
            <div className="social-connect">
              <h3 className="social-title">Connect Social Accounts</h3>
              <div className="social-icons">
                <div className="social-icon facebook">
                  <i className="fb">f</i>
                </div>
                <div className="social-icon twitter">
                  <i className="tw">𝕏</i>
                </div>
                <div className="social-icon instagram">
                  <i className="ig">📷</i>
                </div>
                <div className="social-icon linkedin">
                  <i className="li">in</i>
                </div>
              </div>
            </div>

            <div className="outer-btns">
              <button className="in-btns" onClick={() => navigate("/myads")}>
                My Ads
              </button>

              <button className="in-btns" onClick={() => navigate("/wishlist")}>
                Wishlist
              </button>

              {/* New Button for Account Settings */}
              <button
                className="in-btns"
                onClick={() => navigate("/account-settings")}
              >
                Account Settings
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

export default Profile;
