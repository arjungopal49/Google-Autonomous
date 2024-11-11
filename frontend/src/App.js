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

  const handleRideRequest = async (request) => {
    try {
      // First, fetch the vehicle and arrival details
      const vehicleResponse = await fetch(`http://127.0.0.1:5000/choose-car?origin=${request.origin}&destination=${request.destination}`, {
        method: 'GET',
      });
      const vehicleData = await vehicleResponse.json();

      if (vehicleData.error) {
        console.error('Error:', vehicleData.error);
        return;
      } else {
        setVehicle(vehicleData.car);
        setArrivalTime(vehicleData['arrival-time']);
      }

      // Next, fetch the route polyline
      const routeResponse = await fetch(`http://127.0.0.1:5000/route?origin=${request.origin}&destination=${request.destination}`, {
        method: 'GET',
      });
      const routeData = await routeResponse.json();
      setEncodedPolyline(routeData.encodedPolyline);
      console.log('Encoded polyline:', routeData.encodedPolyline);

    } catch (error) {
      console.error('Error processing ride request:', error);
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
    </div>
  );
}

export default App;
