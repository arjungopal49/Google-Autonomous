// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import TravelTime from './components/TravelTime';
import RideRequestForm from './components/RideRequestForm';
import MiniDrawer from './components/Sidebar';
import MapComponent from './components/MapComponent'; // Import MapComponent

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [vehicle, setVehicle] = useState(null); // State to store assigned vehicle
  const [mapPosition, setMapPosition] = useState(null); // Map position state

  useEffect(() => {
    fetch('http://localhost:5000/time')
      .then((res) => res.json())
      .then((data) => {
        setCurrentTime(data.time);
        console.log(data.time);
      });
  }, []);

  // Function to handle ride request and fetch assigned vehicle from backend
  const handleRideRequest = async (request) => {
    try {
      const response = await fetch('http://localhost:5000/assign-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      setVehicle(data.vehicle); // Store the assigned vehicle
    } catch (error) {
      console.error('Error assigning vehicle:', error);
    }
  };

  // Update map position when a new location is selected on the map
  const handleMapClick = (location) => {
    setMapPosition(location);
  };

  return (
    <div className="App">
      <div className="app-container"> {/* Flex container */}
        <MiniDrawer />
        <div className="map-wrapper"> {/* Map wrapper to contain map and form */}
          <MapComponent onMapClick={handleMapClick} />
          <div className="overlay-form">
            <RideRequestForm onSubmit={handleRideRequest} />
          </div>
        </div>
      </div>

      {/* Existing TravelTime Component */}
      <TravelTime />

      <p>The current time is {currentTime}.</p>
    </div>
  );
}

export default App;
