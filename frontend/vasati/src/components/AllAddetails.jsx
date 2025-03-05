import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Myads.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaMale, FaFemale, FaVenusMars, FaBorderStyle } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaHeart } from "react-icons/fa"; // Import heart icon
import { FaEdit } from "react-icons/fa";

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

function AllAddetails() {
  const [pgDetails, setPgDetails] = useState([]);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const navigate = useNavigate();
  const [pgs, setPgs] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(storedWishlist);
  }, []);

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

  useEffect(() => {
    const fetchPgDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/advertise/ads`
        );
        setPgs(response.data.map((pg) => ({ ...pg, currentImageIndex: 0 })));
        setPgDetails(response.data);
      } catch (error) {
        console.error("Error fetching PG details:", error);
      }
    };

    fetchPgDetails();
  }, [navigate]);

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
            <p>
              No PGs found. <a href="/advertise">Create an Ad</a>
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AllAddetails;
