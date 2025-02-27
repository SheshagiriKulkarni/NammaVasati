import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import { FaMale, FaFemale, FaVenusMars, FaBorderStyle } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import Navbar from "./Navbar"; // Ensure Navbar is imported correctly
import Footer from "./Footer";
import { FaHeart } from "react-icons/fa"; // Import heart icon

function LandingPage() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [pgList, setPgList] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load wishlist from localStorage or API
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(storedWishlist);
  }, []);

  useEffect(() => {
    fetchPGs();
  }, []);

  const toggleWishlist = (pgId) => {
    let updatedWishlist;
    if (wishlist.includes(pgId)) {
      updatedWishlist = wishlist.filter((id) => id !== pgId); // Remove from wishlist
    } else {
      updatedWishlist = [...wishlist, pgId]; // Add to wishlist
    }

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist)); // Persist data
  };

  const fetchPGs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/advertise"); // Adjust API URL
      setPgList(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching PGs:", error.message || error);
    }
  };

  const fetchLocations = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      // Fetch PG name suggestions
      const pgResponse = await axios.get(
        `http://localhost:5000/api/advertise/pgsbyname?search=${input}`
      );

      const pgSuggestions = pgResponse.data.map((pg) => ({
        type: "pg",
        id: pg._id,
        name: pg.pgName,
      }));

      // Fetch location suggestions from OpenStreetMap
      const locationResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: input,
            format: "json",
            addressdetails: 1,
            limit: 5,
          },
        }
      );

      const locationSuggestions = locationResponse.data.map((item) => ({
        type: "location",
        id: item.place_id,
        name: item.display_name,
      }));

      // Combine PG and location suggestions
      setSuggestions([...pgSuggestions, ...locationSuggestions]);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error.message || error);
    }
  };

  const handleAdClick = (adId) => {
    console.log(adId);
    navigate(`/addetails/${adId}`); // Navigates to the ad's page
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

  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    setSelectedLocation(suggestion.name);
    setShowDropdown(false);

    if (suggestion.type === "pg") {
      navigate(`/addetails/${suggestion.id}`);
    } else {
      // Navigate to searched results page
      navigate(`/searched/${suggestion.name}`);
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Latitude:", latitude, "Longitude:", longitude);

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
              },
            }
          );

          if (response.data && response.data.display_name) {
            const locationName = response.data.display_name;
            setQuery(locationName); // Set location in input
            setSelectedLocation(locationName); // Update selected location
          } else {
            alert("Unable to fetch location details.");
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error.message || error);
        }
      },
      (error) => {
        console.error("Error getting location:", error.message || error);
        alert("Unable to fetch location. Please ensure location is enabled.");
      }
    );
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/searched/${query}`);
    }
  };

  return (
    <div className="container">
      <Navbar />
      <div className="banner">
        <div className="search-holder">
          <p>Search PGs Near You</p>
          <div className="search-input" style={{ position: "relative" }}>
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => query && setShowDropdown(true)}
              placeholder="Search a Vasati for You!"
            />
            <div className="sea-btns">
              <button
                className="locationicon"
                onClick={handleGetCurrentLocation}
              ></button>
              <button className="searchicon" onClick={handleSearch}></button>
            </div>

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
                    key={suggestion.id}
                    onClick={() => handleSelect(suggestion)}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #ddd",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {suggestion.type === "pg" ? (
                      <FaBorderStyle style={{ color: "blue" }} />
                    ) : (
                      <FaBorderStyle style={{ color: "green" }} />
                    )}
                    {suggestion.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="real-content">
        <div className="featured-pg">
          <div className="pg-name">
            <p>Featured PGs</p>
            <button>All</button>
          </div>

          <div className="pg-list">
            {pgList.length > 0 ? (
              pgList.map((ad) => (
                <div
                  className="card"
                  key={ad._id}
                  onClick={() => handleAdClick(ad._id)}
                >
                  <div className="image-container">
                    {ad.images && ad.images.length > 0 ? (
                      <div className="image-slider">
                        {ad.images.map((image, index) => (
                          <img
                            key={index}
                            src={`http://localhost:5000/api/advertise/images/${image}`}
                            alt={ad.pgName}
                            className="pg-image"
                          />
                        ))}
                      </div>
                    ) : (
                      <img
                        src="/default-image.jpg"
                        alt="No image available"
                        className="pg-image"
                      />
                    )}

                    <FaHeart
                      className={`wishlist-icon ${
                        wishlist.includes(ad._id) ? "active" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering card click
                        toggleWishlist(ad._id);
                      }}
                    />
                  </div>

                  <div className="pg-details">
                    <div className="name-and-price">
                      <h3>{ad.pgName}</h3>

                      <p>
                        <strong>₹{ad.price}/month</strong>
                      </p>
                    </div>
                    <p>Gender: {ad.gender}</p>
                    <p className="occupancy">
                      <img
                        class="occupancy-icon"
                        src="https://res.cloudinary.com/stanza-living/image/upload/v1700809285/Website%20v5/Icons/tabler_bed.png"
                      />
                      {ad.occupancy}
                    </p>
                    <p title={ad.locationName}>
                      {ad.locationName.length > 20
                        ? ad.locationName.slice(0, 20) + "..."
                        : ad.locationName}
                    </p>
                    <div className="btns-in-card">
                      <button>Reserve</button>
                      <button>Call Back</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No PGs available</p>
            )}
          </div>
        </div>

        <div className="search-in-map">
          <div className="description">
            <p className="p-first">Search Your PG On the Map</p>
            <p className="p-second">
              Find the PG you are looking for easily according to location
              information.
            </p>

            <button>Search On Map</button>
          </div>
          <div className="loc-img"></div>
        </div>
      </div>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default LandingPage; // Ensure this line exists
