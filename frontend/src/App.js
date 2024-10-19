import React, { useState, useEffect } from 'react';
import logo from './g-a.png';
import './App.css';
import TravelTime from './components/TravelTime';
import RideRequestForm from './components/RideRequestForm';
import AssignedVehicle from './components/AssignedVehicle';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [vehicle, setVehicle] = useState(null);  // State to store assigned vehicle

  useEffect(() => {
    fetch('http://localhost:5000/time')
      .then(res => res.json())
      .then(data => {
        setCurrentTime(data.time);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/request-car')
      .then(res => res.json())
      .then(data => {
        console.log('Free car:', data);
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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        

        {/* Ride Request Form */}
        <RideRequestForm onSubmit={handleRideRequest} />

        {/* Display Assigned Vehicle */}
        <AssignedVehicle vehicle={vehicle} />

        {/* Existing TravelTime Component */}
        <TravelTime />
      </header>
      <p>The current time is {currentTime}.</p>
    </div>
  );
}

export default App;
