

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Myads.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaHeart } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ChatModal from "./ChatModal";

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

function Wishlist() {
  const [pgs, setPgs] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatOwner, setChatOwner] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

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
        const response = await axios.post("http://localhost:5000/api/advertise/wishlist", { wishlist });
        setPgs(response.data);
      } catch (error) {
        console.error("Error fetching wishlisted PG details:", error);
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
  

  return (
    <div>
      <Navbar />
      <div className="myads-container">
        <div className="filtered-pgs">
          {pgs.length > 0 ? (
            <div className="result-box">
              <div className="content-real">
                {pgs.map((ad) => (
                  <div
                    key={ad._id}
                    className="searched-pg"
                    onMouseEnter={() => ad.latitude && ad.longitude && setMapCenter([ad.latitude, ad.longitude])}
                  >
                    <div className="about-ad">
                      <h3>{ad.pgName || "Unnamed PG"}</h3>
                      <p>{ad.locationName || "Location Not Available"}</p>
                      <p>₹ {ad.price || "N/A"} / month</p>
                      <button className="ca-btn" onClick={() => openChat(ad.mailid)}>
                        Request a Callback
                      </button>
                    </div>
                    <FaHeart
                      className={`wishlist-icon ${wishlist.includes(ad._id) ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(ad._id);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="map-container">
                <MapContainer center={mapCenter} zoom={15} className="leaflet-container">
                  <ChangeMapCenter center={mapCenter} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {pgs.map(
                    (ad) =>
                      ad.latitude &&
                      ad.longitude && (
                        <Marker key={ad._id} position={[ad.latitude, ad.longitude]} icon={customIcon}>
                          <Popup>
                            <strong>{ad.pgName}</strong>
                            <br />
                            {ad.locationName || "Location not available"}
                            <br />₹ {ad.price || "N/A"} / month
                          </Popup>
                        </Marker>
                      )
                  )}
                </MapContainer>
              </div>
            </div>
          ) : (
            <p>No PGs found.</p>
          )}
        </div>
      </div>

      {isChatOpen &&  (
        <ChatModal
          roomId={chatRoomId}
          senderEmail={userEmail}
          receiverEmail={chatOwner}
          onClose={closeChat}
        />
      )}

      <Footer />
    </div>
  );
}

export default Wishlist;
