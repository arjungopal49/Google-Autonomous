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
  const [arrivalTime, setArrivalTime] = useState(null);
  const [encodedPolyline, setEncodedPolyline] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/time')
      .then((res) => res.json())
      .then((data) => {
        setCurrentTime(data.time);
      });
  }, []);

  const fetchRoutePolyline = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/route?origin=Madison,WI&destination=Chicago,IL', {
        method: 'GET',
      });
      const data = await response.json();
      setEncodedPolyline(data.encodedPolyline);
      console.log('Encoded polyline:', data.encodedPolyline);
    } catch (error) {
      console.error('Error fetching route polyline:', error);
    }
  };

  const handleRideRequest = async (request) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/choose-car?origin=${request.origin}&destination=${request.destination}`, {
        method: 'GET',
      });

      const data = await response.json();
      if (data.error) {
        console.error('Error:', data.error);
      } else {
        setVehicle(data.car);
        setArrivalTime(data['arrival-time']);
        setEncodedPolyline(data.route);
      }
    } catch (error) {
      console.error('Error choosing vehicle:', error);
    }
  };

  // Define the missing handleFreeAllCars function
  const handleFreeAllCars = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/free-all-cars', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('All cars freed successfully');
      } else {
        console.error('Failed to free all cars');
      }
    } catch (error) {
      console.error('Error freeing all cars:', error);
    }
  };

  return (
    <div className="App">
      <div className="app-container">
        <MiniDrawer />
        <div className="map-wrapper">
          <MapComponent encodedPolyline={encodedPolyline} />
          <div className="overlay-form">
            <RideRequestForm onSubmit={handleRideRequest} />
          </div>

          {vehicle && (
            <div className="assigned-vehicle-overlay">
              <AssignedVehicle vehicle={vehicle} arrivalTime={arrivalTime} />
            </div>
          )}
        </div>
      </div>

      <TravelTime />
      <p>The current time is {currentTime}.</p>
      
      {/* Add button to free all cars */}
      <button onClick={handleFreeAllCars}>Free All Cars</button>

      {/* Add button to fetch route polyline */}
      <button onClick={fetchRoutePolyline}>Fetch Route Polyline</button>
    </div>
  );
}

export default App;
