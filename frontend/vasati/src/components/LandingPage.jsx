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
import ChatModal from "./ChatModal";
import "./ChatModal.css";

function LandingPage() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [pgList, setPgList] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();
  const [imageIndexes, setImageIndexes] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const userEmail = localStorage.getItem("userEmail");

  //Chat feature
  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatOwner, setChatOwner] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = (ownerEmail) => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please log in to chat.");
      return;
    }

    const roomId = [userEmail, ownerEmail].sort().join("_");
    setChatRoomId(roomId);
    setChatOwner(ownerEmail);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setChatRoomId(null);
    setChatOwner(null);
  };

  useEffect(() => {
    fetchPGs();
    fetchWishlist();
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [userEmail]);

  const fetchWishlist = async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/wishlist?email=${userEmail}`
      );
      setWishlist(response.data.wishlisted_ads || []);
      localStorage.setItem(
        "wishlist",
        JSON.stringify(response.data.wishlisted_ads || [])
      );
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const toggleWishlist = async (adId) => {
    let updatedWishlist;
    if (wishlist.includes(adId)) {
      updatedWishlist = wishlist.filter((id) => id !== adId);
    } else {
      updatedWishlist = [...wishlist, adId];
    }

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

    try {
      await axios.post("http://localhost:5000/api/wishlist/update-wishlist", {
        email: localStorage.getItem("userEmail"),
        wishlisted_ads: updatedWishlist,
      });
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
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

  const handleAllClick = () => {
    navigate("/AllAddetails");
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
  const sendReserveMessage = async (ownerEmail) => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please log in to chat.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/chat/send", {
        senderEmail: userEmail,
        receiverEmail: ownerEmail,
        message: "Please reserve this PG for me",
      });
    } catch (error) {
      console.error("Error sending reservation message:", error);
    }
  };

  const prevImage = (adId) => {
    setActiveImageIndex((prevIndexes) => {
      const currentIndex = prevIndexes[adId] || 0;
      const newIndex =
        currentIndex === 0
          ? pgList.find((pg) => pg._id === adId).images.length - 1
          : currentIndex - 1;
      return { ...prevIndexes, [adId]: newIndex };
    });
  };

  const nextImage = (adId) => {
    setActiveImageIndex((prevIndexes) => {
      const currentIndex = prevIndexes[adId] || 0;
      const imagesCount = pgList.find((pg) => pg._id === adId).images.length;
      const newIndex = (currentIndex + 1) % imagesCount;
      return { ...prevIndexes, [adId]: newIndex };
    });
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
            <p className="alllink" onClick={handleAllClick}>
              Show All
            </p>
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
                        <button
                          className="nav-button prev-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigation
                            prevImage(ad._id);
                          }}
                        >
                          &#8249;
                        </button>
                        {ad.images.map((image, index) => (
                          <img
                            key={index}
                            src={`http://localhost:5000/api/advertise/images/${
                              ad.images[activeImageIndex[ad._id] || 0]
                            }`}
                            alt={ad.pgName}
                            className="pg-images"
                          />
                        ))}
                        <button
                          className="nav-button next-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigation
                            nextImage(ad._id);
                          }}
                        >
                          &#8250;
                        </button>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click event
                          openChat(ad.mailid); // Open chat
                          sendReserveMessage(ad.mailid); // Send the reserve message
                        }}
                      >
                        Reserve
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click event
                          console.log(ad.mailid);
                          openChat(ad.mailid);
                        }}
                      >
                        Call Back
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No PGs available</p>
            )}
          </div>
        </div>
        {isChatOpen && (
          <ChatModal
            roomId={chatRoomId}
            senderEmail={localStorage.getItem("userEmail")}
            receiverEmail={chatOwner}
            onClose={closeChat}
          />
        )}

        <div className="search-in-map">
          <div className="description">
            <p className="p-first">
              Search Your PG On the Map,&nbsp;Find the PG you are looking for
              easily according to location information by clicking here 👉&nbsp;
            </p>

            <button onClick={() => navigate("/onmap")}>Search On Map</button>
          </div>
        </div>
      </div>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default LandingPage; // Ensure this line exists
