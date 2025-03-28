import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./SearchedPage.css";
import { FaMale, FaFemale, FaVenusMars, FaBorderStyle } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon issue in Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to update the map view dynamically
const ChangeMapCenter = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom(), { animate: true });
  return null;
};

const GenderTag = ({ gender }) => {
  const getGenderStyles = (gender) => {
    switch (gender.toLowerCase()) {
      case "male":
        return {
          color: "black",
          backgroundColor: "rgb(237, 244, 255)",
          width: "80px",
          height: "18px",
          borderRadius: "17px",
          border: "1px solid white",
          icon: <FaMale />,
        };
      case "female":
        return {
          color: "black",
          backgroundColor: "rgb(255, 239, 250)",
          width: "80px",
          height: "18px",
          borderRadius: "17px",
          border: "1px solid white",
          icon: <FaFemale />,
        };
      case "unisex":
        return {
          color: "black",
          backgroundColor: "rgb(235, 216, 213)",
          width: "80px",
          height: "18px",
          borderRadius: "17px",
          border: "1px solid white",
          icon: <FaVenusMars />,
        };
      default:
        return { color: "black", backgroundColor: "gray", icon: null };
    }
  };

  const styles = getGenderStyles(gender);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
        borderRadius: "5px",
        fontWeight: "bold",
        width: "120px",
        gap: "5px",
        ...styles,
      }}
    >
      {styles.icon}
      <span>{gender}</span>
    </div>
  );
};

function SearchedPage() {
  const { search } = useParams();
  const navigate = useNavigate();
  const [pgs, setPgs] = useState([]);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");

  // Improved filter state management
  const [filters, setFilters] = useState({
    locality: "",
    gender: [],
    budget: "",
    sortOption: "priceHighToLow",
  });

  // Dropdown state management
  const [dropdowns, setDropdowns] = useState({
    locality: false,
    gender: false,
    budget: false,
    sortBy: false,
  });

  // Temporary state for filter dropdowns
  const [tempFilters, setTempFilters] = useState({
    locality: filters.locality,
    gender: [...filters.gender],
    budget: filters.budget,
  });

  // Toggle dropdown
  const toggleDropdown = (dropdown) => {
    setDropdowns((prev) => {
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === dropdown ? !prev[key] : false;
        return acc;
      }, {});
      return newState;
    });
  };

  // Handle gender filter selection
  const handleGenderFilter = (gender) => {
    setTempFilters((prev) => {
      const currentGenders = prev.gender;
      const newGenders = currentGenders.includes(gender)
        ? currentGenders.filter((g) => g !== gender)
        : [...currentGenders, gender];

      return { ...prev, gender: newGenders };
    });
  };

  // Save filters
  const saveFilters = () => {
    setFilters((prev) => ({
      ...prev,
      locality: tempFilters.locality,
      gender: tempFilters.gender,
      budget: tempFilters.budget,
    }));

    // Close all dropdowns
    setDropdowns({
      locality: false,
      gender: false,
      budget: false,
      sortBy: false,
    });
  };

  // Remove a specific filter
  const removeFilter = (type, value) => {
    setFilters((prev) => {
      if (type === "locality") {
        return { ...prev, locality: "" };
      }
      if (type === "gender") {
        return {
          ...prev,
          gender: prev.gender.filter((g) => g !== value),
        };
      }
      if (type === "budget") {
        return { ...prev, budget: "" };
      }
      return prev;
    });
  };

  // Fetch and filter PGs
  const fetchPGs = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/advertise/pgs?search=${search}`
      );

      let filteredPGs = response.data;

      // Apply locality filter
      if (filters.locality) {
        filteredPGs = filteredPGs.filter((pg) =>
          pg.locationName.toLowerCase().includes(filters.locality.toLowerCase())
        );
      }

      // Apply gender filter
      if (filters.gender.length > 0) {
        filteredPGs = filteredPGs.filter((pg) =>
          filters.gender.some(
            (gender) => gender.toLowerCase() === pg.gender.toLowerCase()
          )
        );
      }

      // Apply budget filter
      if (filters.budget) {
        filteredPGs = filteredPGs.filter(
          (pg) => pg.price <= parseInt(filters.budget, 10)
        );
      }

      // Apply sorting
      switch (filters.sortOption) {
        case "priceHighToLow":
          filteredPGs.sort((a, b) => b.price - a.price);
          break;
        case "priceLowToHigh":
          filteredPGs.sort((a, b) => a.price - b.price);
          break;
        case "pgNameAsc":
          filteredPGs.sort((a, b) => a.pgName.localeCompare(b.pgName));
          break;
        case "pgNameDesc":
          filteredPGs.sort((a, b) => b.pgName.localeCompare(a.pgName));
          break;
        default:
          break;
      }

      setPgs(filteredPGs.map((pg) => ({ ...pg, currentImageIndex: 0 })));
    } catch (error) {
      console.error("Error fetching PGs:", error);
    }
  };

  // Existing methods from previous implementation
  const nextImage = (pgId) => {
    setPgs((prevPgs) =>
      prevPgs.map((pg) =>
        pg._id === pgId
          ? {
              ...pg,
              currentImageIndex: (pg.currentImageIndex + 1) % pg.images.length,
            }
          : pg
      )
    );
  };

  const prevImage = (pgId) => {
    setPgs((prevPgs) =>
      prevPgs.map((pg) =>
        pg._id === pgId
          ? {
              ...pg,
              currentImageIndex:
                (pg.currentImageIndex - 1 + pg.images.length) %
                pg.images.length,
            }
          : pg
      )
    );
  };

  const handleAdClick = (adId) => {
    navigate(`/addetails/${adId}`);
  };

  // Existing search and location methods
  const fetchLocations = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      const pgResponse = await axios.get(
        `http://localhost:5000/api/advertise/pgs?search=${input}`
      );

      const pgSuggestions = pgResponse.data.map((pg) => ({
        type: "pg",
        id: pg._id,
        name: pg.pgName,
      }));

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

      setSuggestions([...pgSuggestions, ...locationSuggestions]);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error.message || error);
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

  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    setSelectedLocation(suggestion.name);
    setShowDropdown(false);

    if (suggestion.type === "pg") {
      navigate(`/addetails/${suggestion.id}`);
    } else {
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
            setQuery(locationName);
            setSelectedLocation(locationName);
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
      setShowDropdown(false);
      navigate(`/searched/${query}`);
    }
  };

  // Fetch PGs when filters change
  useEffect(() => {
    fetchPGs();
  }, [search, filters]);

  return (
    <div>
      <Navbar />
      <div className="filters-row">
        <div className="search-input" style={{ position: "relative" }}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query && setShowDropdown(true)}
            placeholder={`${search}`}
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

        {/* Filters Container */}
        <div className="filters-container">
          {/* Locality Filter */}
          Filters:
          <div className="filter-group">
            <button
              onClick={() => toggleDropdown("locality")}
              className={`filter-button ${dropdowns.locality ? "active" : ""}`}
            >
              Locality{" "}
              {filters.locality && <span className="filter-indicator">•</span>}
            </button>
            {dropdowns.locality && (
              <div className="filter-dropdown">
                <input
                  type="text"
                  placeholder="Enter locality"
                  value={tempFilters.locality}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      locality: e.target.value,
                    }))
                  }
                />
                <button onClick={saveFilters}>Save</button>
              </div>
            )}
          </div>
          {/* Gender Filter */}
          <div className="filter-group">
            <button
              onClick={() => toggleDropdown("gender")}
              className={`filter-button ${dropdowns.gender ? "active" : ""}`}
            >
              Gender{" "}
              {filters.gender.length > 0 && (
                <span className="filter-indicator">•</span>
              )}
            </button>
            {dropdowns.gender && (
              <div className="filter-dropdown">
                {["Male", "Female", "Unisex"].map((gender) => (
                  <label key={gender} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={tempFilters.gender.includes(gender)}
                      onChange={() => handleGenderFilter(gender)}
                    />
                    {gender}
                  </label>
                ))}
                <button onClick={saveFilters}>Save</button>
              </div>
            )}
          </div>
          {/* Budget Filter */}
          <div className="filter-group">
            <button
              onClick={() => toggleDropdown("budget")}
              className={`filter-button ${dropdowns.budget ? "active" : ""}`}
            >
              Budget{" "}
              {filters.budget && <span className="filter-indicator">•</span>}
            </button>
            {dropdowns.budget && (
              <div className="filter-dropdown">
                <input
                  type="number"
                  placeholder="Max budget"
                  value={tempFilters.budget}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      budget: e.target.value,
                    }))
                  }
                />
                <button onClick={saveFilters}>Save</button>
              </div>
            )}
          </div>
          {/* Sort By Filter */}
          <div className="filter-group">
            <button
              onClick={() => toggleDropdown("sortBy")}
              className={`filter-button ${dropdowns.sortBy ? "active" : ""}`}
            >
              Sort By
            </button>
            {dropdowns.sortBy && (
              <div className="filter-dropdown">
                {[
                  { value: "priceHighToLow", label: "Price: High to Low" },
                  { value: "priceLowToHigh", label: "Price: Low to High" },
                  { value: "pgNameAsc", label: "PG Name: A-Z" },
                  { value: "pgNameDesc", label: "PG Name: Z-A" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        sortOption: option.value,
                      }));
                      setDropdowns((prev) => ({ ...prev, sortBy: false }));
                    }}
                    className={
                      filters.sortOption === option.value ? "selected" : ""
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
      </div>

      <div className="active-filters">
        {filters.locality && (
          <div className="active-filter">
            {filters.locality}
            <button onClick={() => removeFilter("locality")}>×</button>
          </div>
        )}
        {filters.gender.map((gender) => (
          <div key={gender} className="active-filter">
            {gender}
            <button onClick={() => removeFilter("gender", gender)}>×</button>
          </div>
        ))}
        {filters.budget && (
          <div className="active-filter">
            Up to ₹{filters.budget}
            <button onClick={() => removeFilter("budget")}>×</button>
          </div>
        )}
      </div>

      <div className="filtered-pgs">
        <h3 className="heading">{`${pgs.length} PG(s) Waiting For You in ${search}`}</h3>
        {pgs.length > 0 ? (
          <div className="result-box">
            <div className="content-real">
              {pgs.map((ad) => (
                <div
                  className="searched-pg"
                  key={ad._id}
                  onMouseEnter={() => setMapCenter([ad.latitude, ad.longitude])}
                >
                  <div className="image-content">
                    {ad.images && ad.images.length > 0 ? (
                      <>
                        <button
                          className="nav-button prev-button"
                          onClick={() => prevImage(ad._id)}
                        >
                          &#8249;
                        </button>
                        <img
                          src={`http://localhost:5000/api/advertise/images/${
                            ad.images[ad.currentImageIndex]
                          }`}
                          alt={`PG Image ${ad.currentImageIndex + 1}`}
                          className="ad-image"
                        />
                        <button
                          className="nav-button next-button"
                          onClick={() => nextImage(ad._id)}
                        >
                          &#8250;
                        </button>
                      </>
                    ) : (
                      <p>No images available</p>
                    )}
                  </div>
                  <div
                    className="about-ad"
                    onClick={() => handleAdClick(ad._id)}
                  >
                    <div className="rowone">
                      <div>
                        <h3>{`${ad.pgName}`}</h3>
                        <p title={ad.locationName}>
                          {ad.locationName.length > 15
                            ? ad.locationName.slice(0, 15) + "..."
                            : ad.locationName}
                        </p>
                      </div>
                      <div>
                        <GenderTag gender={ad.gender} />
                      </div>
                    </div>
                    <div className="rowtwo">
                      <p className="occupancy">
                        <img
                          className="occupancy-icon"
                          src="https://res.cloudinary.com/stanza-living/image/upload/v1700809285/Website%20v5/Icons/tabler_bed.png"
                          alt="Occupancy"
                        />
                        {ad.occupancy}
                      </p>
                    </div>

                    <div className="rowthree">
                      <div>₹ {ad.price} / month</div>
                      <button className="vi-btn">Schedule a Visit</button>
                      <button className="ca-btn">Request a Callback</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="map-container">
              <MapContainer
                center={mapCenter}
                zoom={15}
                className="leaflet-container"
              >
                <ChangeMapCenter center={mapCenter} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {pgs.map((ad) => (
                  <Marker
                    key={ad._id}
                    position={[ad.latitude, ad.longitude]}
                    icon={customIcon}
                  >
                    <Popup>
                      <strong>{ad.pgName}</strong>
                      <br />
                      {ad.locationName}
                      <br />₹ {ad.price} / month
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        ) : (
          <p>No PGs found</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default SearchedPage;
