import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Myads.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaHeart } from "react-icons/fa";
import { FaMale, FaFemale, FaVenusMars, FaBorderStyle } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ChatModal from "./ChatModal";
import LoadingScreen from "./LoadingScreen";

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

function Wishlist() {
  const [pgs, setPgs] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatOwner, setChatOwner] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(storedWishlist);
  }, []);

  useEffect(() => {
    const fetchPgDetails = async () => {
      if (!userEmail) {
        alert("User email not found. Please log in.");
        navigate("/");
        return;
      }

      if (wishlist.length === 0) {
        setPgs([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:5000/api/advertise/wishlist",
          { wishlist }
        );
        setPgs(response.data.map((pg) => ({ ...pg, currentImageIndex: 0 })));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching wishlisted PG details:", error);
        setLoading(false);
      }
    };

    fetchPgDetails();
  }, [wishlist, navigate]);

  const toggleWishlist = async (adId) => {
    let updatedWishlist = wishlist.includes(adId)
      ? wishlist.filter((id) => id !== adId)
      : [...wishlist, adId];

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

    try {
      await axios.post("http://localhost:5000/api/wishlist/update-wishlist", {
        email: userEmail,
        wishlisted_ads: updatedWishlist,
      });
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const openChat = (ownerEmail) => {
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

  return (
    <div>
      {loading ? (
        <LoadingScreen /> // Show loading screen when loading is true
      ) : (
        <>
          <Navbar />
          <div className="myads-container">
            <div className="filtered-pgs">
              {pgs.length > 0 ? (
                <div className="result-box">
                  <div className="content-real">
                    {pgs.map((ad) => (
                      <div
                        className="searched-pg"
                        onMouseEnter={() =>
                          setMapCenter([ad.latitude, ad.longitude])
                        }
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
                            <button
                              className="ca-btn"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent navigation
                                openChat(ad.mailid);
                              }}
                            >
                              Request a Callback
                            </button>
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
                <>
                  <div className="no-pgs">
                    <div className="back-img"></div>
                    <p className="link">
                      <span onClick={() => navigate("/AllAddetails")}>
                        Click Me
                      </span>{" "}
                      To Add Ads To Your Wishlist.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {isChatOpen && (
            <ChatModal
              roomId={chatRoomId}
              senderEmail={userEmail}
              receiverEmail={chatOwner}
              onClose={closeChat}
            />
          )}

          <Footer />
        </>
      )}
    </div>
  );
}

export default Wishlist;
