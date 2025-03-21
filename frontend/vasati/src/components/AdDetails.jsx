import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatModal from "./ChatModal";
import "./AdDetails.css";

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

function AdDetails() {
  const { adId } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatOwner, setChatOwner] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/advertise/${adId}`
        );
        setAd(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching ad details.");
        setLoading(false);
      }
    };
    fetchAdDetails();
  }, [adId]);

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

  if (loading)
    return <p className="ad-details-loading">Loading ad details...</p>;
  if (error) return <p className="ad-details-loading">{error}</p>;

  return (
    <>
      <Navbar />
      <div className="ad-details-container">
        <div className="ad-details-header">
          <h1 className="ad-details-title">{ad.pgName}</h1>
          <div className="ad-details-actions">
            <button
              className="ad-details-reserve-btn"
              onClick={() => {
                openChat(ad.mailid);
                sendReserveMessage(ad.mailid);
              }}
            >
              Reserve
            </button>
            <div
              className="ad-details-callback"
              onClick={() => openChat(ad.mailid)}
            >
              <img
                className="ad-details-callback-icon"
                src="https://cdn-icons-png.flaticon.com/512/5585/5585856.png"
                alt="Callback"
              />
              Request a Call back
            </div>
          </div>
        </div>

        <div className="ad-details-content">
          <div className="ad-details-gallery">
            {ad.images && ad.images.length > 0 ? (
              <>
                <button
                  className="ad-details-nav-button ad-details-prev-button"
                  onClick={() =>
                    setCurrentImageIndex((prevIndex) =>
                      prevIndex === 0 ? ad.images.length - 1 : prevIndex - 1
                    )
                  }
                >
                  &#8249;
                </button>
                <img
                  src={`http://localhost:5000/api/advertise/images/${ad.images[currentImageIndex]}`}
                  alt={`PG Image ${currentImageIndex + 1}`}
                  className="ad-details-image"
                />
                <button
                  className="ad-details-nav-button ad-details-next-button"
                  onClick={() =>
                    setCurrentImageIndex((prevIndex) =>
                      prevIndex === ad.images.length - 1 ? 0 : prevIndex + 1
                    )
                  }
                >
                  &#8250;
                </button>
              </>
            ) : (
              <p>No images available</p>
            )}
          </div>

          <div className="ad-details-info-section">
            <div className="ad-details-map-wrapper">
              <MapContainer
                center={[ad.latitude, ad.longitude]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                key={`${ad.latitude}-${ad.longitude}`}
              >
                <MapResizer />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[ad.latitude, ad.longitude]}
                  icon={customIcon}
                >
                  <Popup>{ad.locationName || "Selected Location"}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="ad-details-info-wrapper">
              <div className="ad-details-info-box">
                <div className="ad-details-info-item">
                  <strong className="ad-details-info-label">PG Name:</strong>
                  <span className="ad-details-info-value">{ad.pgName}</span>
                </div>
                <div className="ad-details-info-item">
                  <strong className="ad-details-info-label">Price:</strong>
                  <span className="ad-details-info-value">₹{ad.price}</span>
                </div>
                <div className="ad-details-info-item">
                  <strong className="ad-details-info-label">Location:</strong>
                  <span className="ad-details-info-value">
                    {ad.locationName}
                  </span>
                </div>
                <div className="ad-details-info-item">
                  <strong className="ad-details-info-label">
                    Gender Preference:
                  </strong>
                  <span className="ad-details-info-value">{ad.gender}</span>
                </div>
                <div className="ad-details-info-item">
                  <strong className="ad-details-info-label">Occupancy:</strong>
                  <span className="ad-details-info-value">{ad.occupancy}</span>
                </div>
                <div className="ad-details-info-item">
                  <strong className="ad-details-info-label">Amenities:</strong>
                  <span className="ad-details-info-value">
                    {ad.amenities.join(", ")}
                  </span>
                </div>
                <div className="ad-details-info-item">
                  <strong className="ad-details-info-label">
                    Description:
                  </strong>
                  <span className="ad-details-info-value">
                    {ad.description}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isChatOpen && (
          <ChatModal
            roomId={chatRoomId}
            senderEmail={localStorage.getItem("userEmail")}
            receiverEmail={chatOwner}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

export default AdDetails;
