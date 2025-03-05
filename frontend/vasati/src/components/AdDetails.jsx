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

  if (loading) return <p>Loading ad details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="advertise-page-cont">
      <Navbar />
      <div className="ad-title">
        <h1>{ad.pgName}</h1>
        <div className="title-btns">
          <button onClick={() => { openChat(ad.mailid); sendReserveMessage(ad.mailid); }}>Reserve</button>
          <div className="callback" onClick={() => openChat(ad.mailid)}>
            <img src="https://cdn-icons-png.flaticon.com/512/5585/5585856.png" alt="Callback" />
            Request a Call back
          </div>
        </div>
      </div>

      <div className="ad-content">
        <div className="image-content">
          {ad.images && ad.images.length > 0 ? (
            <>
              <button className="nav-button prev-button" onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? ad.images.length - 1 : prevIndex - 1))}>
                &#8249;
              </button>
              <img
                src={`http://localhost:5000/api/advertise/images/${ad.images[currentImageIndex]}`}
                alt={`PG Image ${currentImageIndex + 1}`}
                className="ad-image"
              />
              <button className="nav-button next-button" onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex === ad.images.length - 1 ? 0 : prevIndex + 1))}>
                &#8250;
              </button>
            </>
          ) : (
            <p>No images available</p>
          )}
        </div>

        <div className="real-content">
          <div className="map-container">
            <MapContainer center={[ad.latitude, ad.longitude]} zoom={13} style={{ height: "100%", width: "100%" }} key={`${ad.latitude}-${ad.longitude}`}>
              <MapResizer />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[ad.latitude, ad.longitude]} icon={customIcon}>
                <Popup>{ad.locationName || "Selected Location"}</Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="input-container">
            <div className="ad-details-box">
              <div className="ad-detail"><strong>PG Name:</strong> <span>{ad.pgName}</span></div>
              <div className="ad-detail"><strong>Price:</strong> <span>₹{ad.price}</span></div>
              <div className="ad-detail"><strong>Location:</strong> <span>{ad.locationName}</span></div>
              <div className="ad-detail"><strong>Gender Preference:</strong> <span>{ad.gender}</span></div>
              <div className="ad-detail"><strong>Occupancy:</strong> <span>{ad.occupancy}</span></div>
              <div className="ad-detail"><strong>Amenities:</strong> <span>{ad.amenities.join(", ")}</span></div>
              <div className="ad-detail"><strong>Description:</strong> <span>{ad.description}</span></div>
            </div>
          </div>
        </div>
      </div>
      {isChatOpen && <ChatModal roomId={chatRoomId} senderEmail={localStorage.getItem("userEmail")} receiverEmail={chatOwner} onClose={() => setIsChatOpen(false)} />}
      <Footer />
    </div>
  );
}

export default AdDetails;
