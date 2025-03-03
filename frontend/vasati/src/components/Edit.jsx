import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Advertise.css";
import { useParams, useNavigate } from "react-router-dom";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png", // Map marker icon
  iconSize: [30, 30],
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
}

function Advertise() {
  const [images, setImages] = useState(Array(6).fill(null));
  const { adId } = useParams(); // Get adId from the URL
  const [pgName, setPgName] = useState("");
  const [price, setPrice] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

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
    lat: 28.6139, // Default to New Delhi, India
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
  const [selectedOccupancy, setSelectedOccupancy] = useState("");

  // Toggle Dropdowns
  const toggleAmenitiesDropdown = () => setIsAmenitiesOpen(!isAmenitiesOpen);
  const toggleOccupancyDropdown = () => setIsOccupancyOpen(!isOccupancyOpen);

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
      console.log("images" + images);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null; // Reset slot to null
    setImages(newImages);
  };

  useEffect(() => {
    if (adId) {
      fetchAdDetails(adId);
    }
  }, [adId]);

  useEffect(() => {
    console.log("Updated Images State:", images);
  }, [images]);

  const fetchAdDetails = async (adId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/advertise/${adId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ad details");
      }

      const data = await response.json();
      console.log(data);

      setPgName(data.pgName || "");
      setPrice(data.price || "");
      setGender(data.gender || "");
      setDescription(data.description || ""); // Set description

      setSelectedLocation({
        lat: data.latitude || 28.6139, // Default to New Delhi if not provided
        lng: data.longitude || 77.209,
        name: data.locationName || "",
      });

      setQuery(data.locationName || ""); // Fill location input field

      setSelectedAmenities(Array.isArray(data.amenities) ? data.amenities : []);

      // Set fetched occupancy
      setSelectedOccupancy(data.occupancy || "");

      if (data.images && data.images.length > 0) {
        const newImages = Array(6).fill(null); // Create a fixed-size array
        data.images.forEach((imageName, index) => {
          if (index < 6) {
            newImages[index] = {
              preview: `http://localhost:5000/api/advertise/images/${imageName}`, // Construct full URL
              file: null,
            };
          }
        });
        setImages(newImages);
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
    }
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
    event.preventDefault(); // Prevent page reload

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
      const response = await fetch(
        `http://localhost:5000/api/advertise/${adId}`,
        {
          method: "PUT", // ✅ Correct method for updating
          body: formData, // No need to set headers for FormData
        }
      );

      if (response.status === 200) {
        alert("Ad updated successfully!");
        setImages(Array(6).fill(null));
        setQuery("");
        setSelectedAmenities([]);
        setSelectedOccupancy("");
        setSelectedLocation({
          lat: 28.6139, // Reset to default location (New Delhi)
          lng: 77.209,
          name: "",
        });

        // Clear input fields manually
        document.getElementById("pgName").value = "";
        document.getElementById("price").value = "";
        document.getElementById("gender").value = "";
        document.getElementById("description").value = "";
        navigate("/myads");
      } else {
        alert("Error posting ad");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="advertise-page-cont">
      <Navbar />
      <div className="ad-content">
        <div className="image-content">
          <div className="image-grid">
            {images.map((image, index) => (
              <div key={index} className="image-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageUpload(event, index)}
                  className="file-input"
                />
                {image ? (
                  <>
                    <img
                      src={image.preview}
                      alt={`Preview ${index}`}
                      className="preview-image"
                    />
                    <button
                      className="remove-btn"
                      onClick={() => removeImage(index)}
                    >
                      X
                    </button>
                  </>
                ) : (
                  <div className="placeholder">+</div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="real-content">
          <div className="map-container">
            <div className="sea-loc" style={{ position: "relative" }}>
              <input
                id="address"
                name="address"
                value={query}
                onChange={handleInputChange}
                onFocus={() => query && setShowDropdown(true)}
                placeholder="Enter locality, city, state..."
                required
              />

              {showDropdown && suggestions.length > 0 && (
                <div
                  className="dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    maxHeight: "200px",
                    overflowY: "auto",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    zIndex: 1000,
                    marginTop: "5px",
                  }}
                >
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.place_id}
                      onClick={() => handleSelect(suggestion)}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      {suggestion.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <MapContainer
              center={[selectedLocation.lat, selectedLocation.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              key={`${selectedLocation.lat}-${selectedLocation.lng}`} // Forces re-render on location change
            >
              <MapResizer />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={customIcon}
              >
                <Popup>{selectedLocation.name || "Selected Location"}</Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="input-container">
            {/* First Line */}
            <div className="row">
              <input
                type="text"
                id="pgName"
                value={pgName}
                onChange={(e) => setPgName(e.target.value)}
                placeholder="Name Of the PG..."
              />
              <input
                type="text"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price..."
              />
              <input
                type="text"
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder="Gender..."
              />
            </div>

            {/* Second Line */}
            <div className="outer flex gap-4 w-full">
              {/* Amenities Dropdown */}
              <div className="relative w-1/2">
                <input
                  type="text"
                  placeholder="Select Amenities..."
                  readOnly
                  value={selectedAmenities.join(", ")}
                  onClick={toggleAmenitiesDropdown}
                  className="dropdown-input"
                />
                {isAmenitiesOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-options">
                      {amenitiesList.map((amenity) => (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`option-button ${
                            selectedAmenities.includes(amenity)
                              ? "selected"
                              : ""
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                    <div className="dropdown-footer">
                      <button
                        onClick={clearAmenitiesSelection}
                        className="clear-button"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleAmenitiesDone}
                        className="done-button"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Occupancy Dropdown */}
              <div className="relative w-1/2">
                <input
                  type="text"
                  placeholder="Select Occupancy..."
                  readOnly
                  value={selectedOccupancy}
                  onClick={toggleOccupancyDropdown}
                  className="dropdown-input"
                />
                {isOccupancyOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-options">
                      {occupancyOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => selectOccupancy(option)}
                          className={`option-button ${
                            selectedOccupancy === option ? "selected" : ""
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <div className="dropdown-footer">
                      <button
                        onClick={clearOccupancySelection}
                        className="clear-button"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Third Line */}
            <textarea
              className="description"
              id="description"
              value={description}
              placeholder="Description..."
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>
      <div className="advertise-btn">
        <button className="sub-btn" onClick={handleSubmit}>
          Advertise
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default Advertise;
