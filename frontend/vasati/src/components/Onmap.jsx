import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { FaBorderStyle } from "react-icons/fa";
import L from "leaflet";
import "./Onmap.css";

const pgIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/619/619153.png", // House Icon
  iconSize: [30, 30],
});

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
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

function Onmap() {
  const [pgs, setPgs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 28.6139, // Default: New Delhi
    lng: 77.209,
    name: "",
  });

  useEffect(() => {
    fetchPGs();
  }, []);

  const fetchPGs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/advertise"); // Adjust API URL
      setPgs(response.data);
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
      // Fetch PGs
      const pgResponse = await axios.get(
        `http://localhost:5000/api/advertise/pgsbyname?search=${input}`
      );

      const pgSuggestions = pgResponse.data.map((pg) => ({
        type: "pg",
        id: pg._id,
        name: pg.pgName,
        lat: pg.latitude || 0, // Ensure lat/lng exists
        lon: pg.longitude || 0,
      }));

      // Fetch locations
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
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));

      // Merge and update suggestions
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
    setShowDropdown(input.trim() !== "");
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    setShowDropdown(false);

    // Update map location
    setSelectedLocation({
      lat: suggestion.lat,
      lng: suggestion.lon,
      name: suggestion.name,
    });
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

          const locationName =
            response.data?.display_name || "Current Location";
          setQuery(locationName);
          setSelectedLocation({
            lat: latitude,
            lng: longitude,
            name: locationName,
          });
        } catch (error) {
          console.error("Error reverse geocoding:", error.message || error);
        }
      },
      (error) => {
        console.error("Error getting location:", error.message || error);
        alert("Unable to fetch location.");
      }
    );
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/searched/${query}`);
    }
  };

  return (
    <div className="onmap-container">
      <Navbar />
      <div className="org-cont">
        <div className="map-container">
          <div className="flex-cont">
            <div className="search-holder">
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
                  <button
                    className="searchicon"
                    onClick={handleSearch}
                  ></button>
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
                        <FaBorderStyle
                          style={{
                            color: suggestion.type === "pg" ? "blue" : "green",
                          }}
                        />
                        {suggestion.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <MapContainer
            center={[selectedLocation.lat, selectedLocation.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            key={`${selectedLocation.lat}-${selectedLocation.lng}`}
          >
            <MapResizer />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={customIcon}
            >
              <Popup>{selectedLocation.name || "Selected Location"}</Popup>
            </Marker>

            {pgs.map((pg) => (
              <Marker
                key={pg._id}
                position={[pg.latitude, pg.longitude]}
                icon={pgIcon}
              >
                <Popup>
                  <strong>{pg.pgName}</strong> <br />
                  Price: {pg.price}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Onmap;
