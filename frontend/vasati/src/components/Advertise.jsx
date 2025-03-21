import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Advertise.css";
import LoginModal from "./LoginModal";

function Advertise() {
  const [images, setImages] = useState(Array(6).fill(null));
  const amenitiesList = [
    "AC",
    "WiFi",
    "Washing Machine",
    "TV",
    "Geyser",
    "Gym",
    "Fridge",
  ];

  const [selectedLocation, setSelectedLocation] = useState({
    lat: 28.6139,
    lng: 77.209,
    name: "",
  });

  const occupancyOptions = ["Single", "Double", "Triple"];

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");

  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isOccupancyOpen, setIsOccupancyOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const userEmail = localStorage.getItem("userEmail");
  const [selectedOccupancy, setSelectedOccupancy] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false); // Tracks modal
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userEmail")
  );

  // Toggle Dropdowns
  const toggleAmenitiesDropdown = () => setIsAmenitiesOpen(!isAmenitiesOpen);
  const toggleOccupancyDropdown = () => setIsOccupancyOpen(!isOccupancyOpen);

  const handleLoginClick = () => {
    setShowLoginModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowLoginModal(false); // Close the modal
  };

  const handleLoginSuccess = (email) => {
    localStorage.setItem("userEmail", email); // Store user email in localStorage
    setIsLoggedIn(true);
    window.location.reload();
  };

  // Handle Amenities Selection
  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  // Handle Occupancy Selection
  const selectOccupancy = (option) => {
    setSelectedOccupancy(option);
    setIsOccupancyOpen(false);
  };

  // Clear Selections
  const clearAmenitiesSelection = () => setSelectedAmenities([]);
  const clearOccupancySelection = () => setSelectedOccupancy("");

  // Save Selections
  const handleAmenitiesDone = () => setIsAmenitiesOpen(false);

  const handleImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      setImages(newImages);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const fetchLocations = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    const endpoint = `https://nominatim.openstreetmap.org/search`;

    try {
      const response = await axios.get(endpoint, {
        params: {
          q: input,
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        const locationSuggestions = response.data.map((item) => ({
          place_id: item.place_id,
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
        }));
        setSuggestions(locationSuggestions);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error fetching locations:", error.message || error);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    fetchLocations(input);
    if (input.trim() === "") {
      setShowDropdown(false);
    } else {
      setShowDropdown(true);
    }
  };

  const handleSelect = (location) => {
    setQuery(location.display_name);
    setSelectedLocation({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      name: location.display_name,
    });
    setShowDropdown(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    // Add text inputs
    formData.append("pgName", document.getElementById("pgName").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("gender", document.getElementById("gender").value);
    formData.append("amenities", JSON.stringify(selectedAmenities));
    formData.append("occupancy", selectedOccupancy);
    formData.append(
      "description",
      document.getElementById("description").value
    );

    // Add location details
    formData.append("latitude", selectedLocation.lat);
    formData.append("longitude", selectedLocation.lng);
    formData.append("locationName", selectedLocation.name);
    formData.append("mailid", localStorage.getItem("userEmail"));

    // Add images
    images.forEach((image, index) => {
      if (image) {
        formData.append(`images`, image);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/advertise",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        alert("Ad posted successfully!");
        setImages(Array(6).fill(null));
        setQuery("");
        setSelectedAmenities([]);
        setSelectedOccupancy("");
        setSelectedLocation({
          lat: 28.6139,
          lng: 77.209,
          name: "",
        });

        // Clear input fields manually
        document.getElementById("pgName").value = "";
        document.getElementById("price").value = "";
        document.getElementById("gender").value = "";
        document.getElementById("description").value = "";
      } else {
        alert("Error posting ad");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="advertise-page">
      <Navbar />

      {userEmail ? (
        <div className="ad-container">
          <div className="ad-header">
            <h1>Advertise Your PG</h1>
            <p>Fill in the details below to list your PG accommodation</p>
          </div>

          <div className="ad-form">
            <div className="form-section">
              <h2>Add Photos</h2>
              <p className="section-description">
                Add up to 6 photos of your property
              </p>

              <div className="image-upload-grid">
                {images.map((image, index) => (
                  <div key={index} className="image-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(event, index)}
                      className="file-input"
                      id={`image-upload-${index}`}
                    />
                    <label
                      htmlFor={`image-upload-${index}`}
                      className="upload-label"
                    >
                      {image ? (
                        <div className="image-preview-container">
                          <img
                            src={image.preview}
                            alt={`Preview ${index}`}
                            className="preview-image"
                          />
                          <button
                            className="remove-image-btn"
                            onClick={() => removeImage(index)}
                            type="button"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <span className="upload-icon">+</span>
                          <span className="upload-text">Add Photo</span>
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h2>Property Details</h2>

              <div className="input-group">
                <label htmlFor="pgName">Name of PG</label>
                <input
                  type="text"
                  id="pgName"
                  placeholder="Enter PG name"
                  className="form-input"
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="price">Monthly Rent (₹)</label>
                  <input
                    type="text"
                    id="price"
                    placeholder="Enter amount"
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" className="form-select">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Amenities</label>
                  <div className="custom-dropdown">
                    <div
                      className="dropdown-toggle"
                      onClick={toggleAmenitiesDropdown}
                    >
                      {selectedAmenities.length > 0
                        ? selectedAmenities.join(", ")
                        : "Select amenities"}
                      <span className="dropdown-arrow">▼</span>
                    </div>

                    {isAmenitiesOpen && (
                      <div className="dropdown-menu">
                        <div className="dropdown-options">
                          {amenitiesList.map((amenity) => (
                            <div
                              key={amenity}
                              className={`dropdown-option ${
                                selectedAmenities.includes(amenity)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => toggleAmenity(amenity)}
                            >
                              <span className="option-checkbox">
                                {selectedAmenities.includes(amenity) ? "✓" : ""}
                              </span>
                              {amenity}
                            </div>
                          ))}
                        </div>
                        <div className="dropdown-actions">
                          <button
                            type="button"
                            className="clear-btn"
                            onClick={clearAmenitiesSelection}
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            className="done-btn"
                            onClick={handleAmenitiesDone}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <label>Occupancy</label>
                  <div className="custom-dropdown">
                    <div
                      className="dropdown-toggle"
                      onClick={toggleOccupancyDropdown}
                    >
                      {selectedOccupancy || "Select occupancy"}
                      <span className="dropdown-arrow">▼</span>
                    </div>

                    {isOccupancyOpen && (
                      <div className="dropdown-menu">
                        <div className="dropdown-options">
                          {occupancyOptions.map((option) => (
                            <div
                              key={option}
                              className={`dropdown-option ${
                                selectedOccupancy === option ? "selected" : ""
                              }`}
                              onClick={() => selectOccupancy(option)}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                        <div className="dropdown-actions">
                          <button
                            type="button"
                            className="clear-btn"
                            onClick={clearOccupancySelection}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Location</h2>

              <div className="input-group location-input">
                <label htmlFor="address">Address</label>
                <div className="location-search">
                  <input
                    type="text"
                    id="address"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query && setShowDropdown(true)}
                    placeholder="Enter locality, city, state..."
                    className="form-input"
                    required
                  />

                  {showDropdown && suggestions.length > 0 && (
                    <div className="location-suggestions">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.place_id}
                          className="suggestion-item"
                          onClick={() => handleSelect(suggestion)}
                        >
                          {suggestion.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Description</h2>

              <div className="input-group">
                <label htmlFor="description">PG Description</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Describe your PG accommodation, include details about rules, facilities, etc."
                  rows="5"
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="submit-btn"
                onClick={handleSubmit}
              >
                Post Advertisement
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-no-pgs">
          <div className="log-back-img"></div>
          <p className="link">
            <span onClick={handleLoginClick}>Log In</span> To Access The
            Feature.
          </p>
        </div>
      )}

      <Footer />

      {showLoginModal && (
        <LoginModal
          onClose={handleCloseModal}
          onLoginSuccess={(email) => handleLoginSuccess(email)}
        />
      )}
    </div>
  );
}

export default Advertise;
