import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="spinner">
          <div className="spinner-circle"></div>
        </div>
        <h2>Loading Your Properties</h2>
        <p>Please wait while we fetch your listings...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
