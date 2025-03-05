
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./AllAddetails.css";

function AllAddetails() {
  const [pgListings, setPgListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPGListings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/ads");
        setPgListings(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching PG listings.");
        setLoading(false);
      }
    };

    fetchPGListings();
  }, []);

  if (loading) return <p>Loading PG listings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="all-pg-listings">
      <Navbar />
      <h1>All PG Listings</h1>
      <div className="pg-cards">
        {pgListings.map((pg) => (
          <div key={pg._id} className="pg-card">
            {/* Fetching Image Correctly */}
            <img
              src={`http://localhost:5000/api/advertise/images/${pg.images[0]}`}
              alt={pg.pgName}
              className="pg-image"
              onError={(e) => (e.target.src = "/default-pg-image.png")} // Fallback image
            />
            <h2>{pg.pgName}</h2>
            <p>Price: ₹{pg.price}</p>
            <p>Location: {pg.locationName}</p>
            <Link to={`/Addetails/${pg._id}`} className="details-link">
              View Details
            </Link>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default AllAddetails;
