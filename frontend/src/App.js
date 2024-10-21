// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import TravelTime from './components/TravelTime';
import RideRequestForm from './components/RideRequestForm';
import MiniDrawer from './components/Sidebar';
import MapComponent from './components/MapComponent';
import AssignedVehicle from './components/AssignedVehicle';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [vehicle, setVehicle] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null); // Add state for arrival time
  const [mapPosition, setMapPosition] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/time')
      .then((res) => res.json())
      .then((data) => {
        setCurrentTime(data.time);
        console.log(data.time);
      });
  }, []);

  const handleRideRequest = async (request) => {
    try {
      const response = await fetch(`http://localhost:5000/choose-car?origin=${request.origin}&destination=${request.destination}`, {
        method: 'GET',
      });

      const data = await response.json();
      if (data.error) {
        console.error('Error:', data.error);
      } else {
        setVehicle(data.car); // Store the assigned vehicle
        setArrivalTime(data['arrival-time']); // Store the arrival time separately
        console.log('Assigned Vehicle:', data.car);
        console.log('Arrival Time:', data['arrival-time']);
      }
    } catch (error) {
      console.error('Error choosing vehicle:', error);
    }
  };

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

          {/* Display assigned vehicle below Ride Request Form */}
          {vehicle && (
            <div className="assigned-vehicle-overlay">
              <AssignedVehicle vehicle={vehicle} arrivalTime={arrivalTime} /> {/* Pass arrivalTime as prop */}
            </div>
          )}
        </div>
      </div>

      <TravelTime />
      <p>The current time is {currentTime}.</p>
    </div>
  );
}

export default App;
