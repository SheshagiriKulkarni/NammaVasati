import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
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
        ...styles, // Apply dynamic styles
      }}
    >
      {styles.icon} {/* Display icon */}
      <span>{gender}</span>
    </div>
  );
};

function SearchedPage() {
  const { search } = useParams();
  const [pgs, setPgs] = useState([]);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("priceHighToLow"); // Default sort by price high to low

  const [previousFilters, setPreviousFilters] = useState([]);

  const [filters, setFilters] = useState({
    locality: "",
    gender: "",
    budget: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState({
    locality: false,
    gender: false,
    budget: false,
    sortby: false,
  });

  const sortPGs = (pgs) => {
    switch (sortOption) {
      case "priceHighToLow":
        return [...pgs].sort((a, b) => b.price - a.price); // Sort by price high to low
      case "priceLowToHigh":
        return [...pgs].sort((a, b) => a.price - b.price); // Sort by price low to high
      case "pgNameAsc":
        return [...pgs].sort((a, b) => a.pgName.localeCompare(b.pgName)); // Sort by PG name ascending
      case "pgNameDesc":
        return [...pgs].sort((a, b) => b.pgName.localeCompare(a.pgName)); // Sort by PG name descending
      default:
        return pgs;
    }
  };

  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => {
      // Close all other dropdowns and open the clicked one
      const updatedDropdowns = Object.keys(prev).reduce((acc, curr) => {
        acc[curr] = curr === key ? !prev[curr] : false;
        return acc;
      }, {});
      return updatedDropdowns;
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchPGs = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/advertise/pgs?search=${search}`
      );
      let filteredPGs = response.data;

      if (filters.locality.trim()) {
        // Trim any extra spaces
        filteredPGs = filteredPGs.filter((pg) =>
          pg.locationName.toLowerCase().includes(filters.locality.toLowerCase())
        );
      }
      if (filters.gender.length > 0) {
        filteredPGs = filteredPGs.filter((pg) =>
          filters.gender.some(
            (gender) => gender.toLowerCase() === pg.gender.toLowerCase()
          )
        );
      }
      if (filters.budget) {
        filteredPGs = filteredPGs.filter(
          (pg) => pg.price <= parseInt(filters.budget, 10)
        );
      }

      const sortedPGs = sortPGs(filteredPGs); // Sort the filtered PGs
      setPgs(sortedPGs.map((pg) => ({ ...pg, currentImageIndex: 0 })));
    } catch (error) {
      console.error("Error fetching PGs:", error);
    }
  };

  const selectedFilters = [
    ...previousFilters.filter(
      (prev) =>
        !(
          (prev.type === "locality" && prev.label === filters.locality) ||
          (prev.type === "budget" && prev.label === `₹${filters.budget}`) ||
          (prev.type === "gender" &&
            Array.isArray(filters.gender) &&
            filters.gender.includes(prev.label))
        )
    ), // Keep only those not in current filters

    filters.locality ? { label: filters.locality, type: "locality" } : null,
    ...(Array.isArray(filters.gender)
      ? filters.gender.map((gender) => ({ label: gender, type: "gender" }))
      : []),
    filters.budget ? { label: `₹${filters.budget}`, type: "budget" } : null,
  ].filter(Boolean);

  useEffect(() => {
    fetchPGs();
    setPreviousFilters(selectedFilters); // Store filter history
    console.log(filters);
  }, [search, filters, sortOption]); // Re-run fetchPGs when filters change

  useEffect(() => {
    console.log(previousFilters);
  }, [previousFilters]);

  // Function to handle next image
  const nextImage = (pgId) => {
    setPgs((prevPgs) =>
      prevPgs.map((pg) =>
        pg._id === pgId
          ? {
              ...pg,
              currentImageIndex: (pg.currentImageIndex + 1) % pg.images.length, // Loop back to first image
            }
          : pg
      )
    );
  };

  const handleAdClick = (adId) => {
    console.log(adId);
    navigate(`/addetails/${adId}`); // Navigates to the ad's page
  };

  // Function to handle previous image
  const prevImage = (pgId) => {
    setPgs((prevPgs) =>
      prevPgs.map((pg) =>
        pg._id === pgId
          ? {
              ...pg,
              currentImageIndex:
                (pg.currentImageIndex - 1 + pg.images.length) %
                pg.images.length, // Loop to last image
            }
          : pg
      )
    );
  };

  const fetchLocations = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      // Fetch PG name suggestions
      const pgResponse = await axios.get(
        `http://localhost:5000/api/advertise/pgs?search=${input}`
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
      setShowDropdown(false);
      navigate(`/searched/${query}`);
    }
  };

  const [rotations, setRotations] = useState({
    locality: false,
    gender: false,
    budget: false,
    mfilters: false,
    sortby: false,
  });

  const toggleRotation = (key) => {
    setRotations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [tempFilters, setTempFilters] = useState({ ...filters, gender: [] });

  const handleTempFilterChange = (gender) => {
    setTempFilters((prev) => {
      const newGenderSelection = prev.gender.includes(gender)
        ? prev.gender.filter((g) => g !== gender) // Remove if already selected
        : [...prev.gender, gender]; // Add if not selected

      return { ...prev, gender: newGenderSelection };
    });
  };

  const [tempLocality, setTempLocality] = useState(filters.locality);
  const [tempBudget, setTempBudget] = useState(filters.budget);

  const handleTempLocalityChange = (locality) => {
    setTempLocality(locality);
  };

  const handleTempBudgetChange = (budget) => {
    setTempBudget(budget);
  };

  // Apply temporary filters when clicking "Save"
  const handleSaveFilters = () => {
    setFilters({
      ...tempFilters,
      locality: tempLocality,
      budget: tempBudget,
    });
    setDropdownOpen({ ...dropdownOpen, locality: false, budget: false });
    console.log("Hi");
  };

  const removeFilter = (type, label) => {
    setFilters((prevFilters) => {
      let updatedFilters = { ...prevFilters };

      if (type === "locality") {
        delete updatedFilters.locality;
      } else if (type === "budget") {
        delete updatedFilters.budget;
      } else if (type === "gender") {
        updatedFilters.gender = Array.isArray(prevFilters.gender)
          ? prevFilters.gender.filter((gender) => gender !== label)
          : [];
      }

      return updatedFilters;
    });

    // console.log(filters);

    setPreviousFilters(
      Object.entries(filters).flatMap(([key, value]) =>
        Array.isArray(value)
          ? value.map((v) => ({ type: key, label: v }))
          : [{ type: key, label: value }]
      )
    );
  };

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
        <h2>Filters :</h2>
        <div className="filter">
          <button onClick={() => toggleDropdown("locality")}>
            Locality
            <img
              src="https://st4.depositphotos.com/14953852/28391/v/450/depositphotos_283913062-stock-illustration-arrow-down-icon-vector-illustration.jpg"
              className={dropdownOpen.locality ? "rotated" : ""}
            />
          </button>

          {dropdownOpen.locality && (
            <div className="dropdown-menu locality-dropdown-menu">
              <input
                type="text"
                placeholder="Enter locality"
                value={tempLocality}
                onChange={(e) => handleTempLocalityChange(e.target.value)}
              />

              <div className="save-btn">
                <button
                  onClick={() => {
                    console.log(tempLocality);
                    handleSaveFilters();
                    setDropdownOpen({ ...dropdownOpen, locality: false });
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="filter">
          <button onClick={() => toggleDropdown("gender")}>
            Gender
            <img
              src="https://st4.depositphotos.com/14953852/28391/v/450/depositphotos_283913062-stock-illustration-arrow-down-icon-vector-illustration.jpg"
              className={dropdownOpen.gender ? "rotated" : ""}
            />
          </button>
          {dropdownOpen.gender && (
            <div className="dropdown-menu gender-dropdown-menu">
              <div className="btns">
                {["Male", "Female", "Unisex"].map((gender) => (
                  <button
                    key={gender}
                    className={
                      tempFilters.gender.includes(gender) ? "selected" : ""
                    }
                    onClick={() => handleTempFilterChange(gender)}
                  >
                    {gender}
                  </button>
                ))}
              </div>
              <hr />
              <div className="save-btn">
                <button
                  onClick={() => {
                    setFilters(tempFilters); // Apply changes only when saving
                    setDropdownOpen({ ...dropdownOpen, gender: false });
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="filter">
          <button onClick={() => toggleDropdown("budget")}>
            Budget
            <img
              src="https://st4.depositphotos.com/14953852/28391/v/450/depositphotos_283913062-stock-illustration-arrow-down-icon-vector-illustration.jpg"
              className={dropdownOpen.budget ? "rotated" : ""}
            />
          </button>
          {dropdownOpen.budget && (
            <div className="dropdown-menu locality-dropdown-menu">
              <input
                type="number"
                placeholder="Enter max budget"
                value={tempBudget}
                onChange={(e) => handleTempBudgetChange(e.target.value)}
              />
              <div className="save-btn">
                <button
                  onClick={() => {
                    handleSaveFilters();
                    setDropdownOpen({ ...dropdownOpen, budget: false });
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="vertical-line"></div>

        <button
          onClick={() => toggleRotation("mfilters")}
          className="mofilters"
        >
          More Filters
          <img
            src="https://st4.depositphotos.com/14953852/28391/v/450/depositphotos_283913062-stock-illustration-arrow-down-icon-vector-illustration.jpg"
            alt="Icon"
            className={rotations.mfilters ? "rotated" : ""}
          />
        </button>

        <div className="filter">
          <button onClick={() => toggleDropdown("sortby")}>
            Sort By
            <img
              src="https://st4.depositphotos.com/14953852/28391/v/450/depositphotos_283913062-stock-illustration-arrow-down-icon-vector-illustration.jpg"
              alt="Icon"
              className={dropdownOpen.sortby ? "rotated" : ""}
            />
          </button>
          {dropdownOpen.sortby && (
            <div className="dropdown-menu budget-dropdown-menu">
              <button
                onClick={() => setSortOption("priceHighToLow")}
                className={sortOption === "priceHighToLow" ? "selected" : ""}
              >
                Price High to Low
              </button>
              <button
                onClick={() => setSortOption("priceLowToHigh")}
                className={sortOption === "priceLowToHigh" ? "selected" : ""}
              >
                Price Low to High
              </button>
              <button
                onClick={() => setSortOption("pgNameAsc")}
                className={sortOption === "pgNameAsc" ? "selected" : ""}
              >
                PG Name Ascending
              </button>
              <button
                onClick={() => setSortOption("pgNameDesc")}
                className={sortOption === "pgNameDesc" ? "selected" : ""}
              >
                PG Name Descending
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sel-filters">
        {selectedFilters.length > 0 && (
          <div className="selected-filters">
            {selectedFilters.map((filter, index) => (
              <span key={index} className="filter-tag">
                {filter.label}
                <button
                  className="rm-btn"
                  onClick={() => removeFilter(filter.type, filter.label)}
                >
                  ✖
                </button>
              </span>
            ))}
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
                  onMouseEnter={() => setMapCenter([ad.latitude, ad.longitude])}
                >
                  <div key={ad._id} className="image-content">
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
                          class="occupancy-icon"
                          src="https://res.cloudinary.com/stanza-living/image/upload/v1700809285/Website%20v5/Icons/tabler_bed.png"
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
