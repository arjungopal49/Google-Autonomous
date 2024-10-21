// src/components/MapComponent.js
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '90vh',
};

const defaultCenter = {
  lat: 43.074902, // Madison Campus
  lng: -89.400569, // Default longitude
};

const MapComponent = ({ onMapClick }) => {
  const [mapPosition, setMapPosition] = useState(defaultCenter);

  const handleMapClick = (event) => {
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMapPosition(newLocation);
    onMapClick(newLocation); 
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyCzPvBLp1FInh8TivgxTr01GzsJO4S78VM">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapPosition}
        zoom={14}
        onClick={handleMapClick}
      >
        <Marker position={mapPosition} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
