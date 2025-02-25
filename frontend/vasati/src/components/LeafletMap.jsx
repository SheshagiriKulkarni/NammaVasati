import React, { useState } from "react";
import ReactMapGL, { Marker } from "react-map-gl";

const MapboxMap = () => {
  const [viewport, setViewport] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 5,
    width: "100%",
    height: "400px",
  });

  const [marker, setMarker] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
  });

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken="YOUR_MAPBOX_ACCESS_TOKEN" // Replace with your token
      onViewportChange={(nextViewport) => setViewport(nextViewport)}
      onClick={(e) =>
        setMarker({ latitude: e.lngLat[1], longitude: e.lngLat[0] })
      }
    >
      <Marker latitude={marker.latitude} longitude={marker.longitude}>
        <div style={{ color: "red" }}>📍</div>
      </Marker>
    </ReactMapGL>
  );
};

export default MapboxMap;
