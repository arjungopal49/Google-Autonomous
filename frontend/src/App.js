import React, { useState, useEffect } from 'react';
import './App.css';
import TravelTime from './components/TravelTime';
import RideRequestForm from './components/RideRequestForm';
import MiniDrawer from './components/Sidebar';
import MapComponent from './components/MapComponent';
import AssignedVehicle from './components/AssignedVehicle';
import RideDetails from './components/RideDetails';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [vehicle, setVehicle] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [encodedPolyline, setEncodedPolyline] = useState(null);
  const [rideOrigin, setRideOrigin] = useState('');
  const [rideDestination, setRideDestination] = useState('');
  const [showRideDetails, setShowRideDetails] = useState(false);
  const [carLocation, setCarLocation] = useState(null); // New state for car location

  useEffect(() => {
    fetch('http://127.0.0.1:5000/time')
      .then((res) => res.json())
      .then((data) => {
        setCurrentTime(data.time);
      });
  }, []);

  const handleRideRequest = async (request) => {
    try {
      setRideOrigin(request.origin);
      setRideDestination(request.destination);
      setShowRideDetails(true);

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
        setCarLocation(vehicleData.car.currentLocation); // Set car location

        const carLocation = `${vehicleData.car.currentLocation[0]},${vehicleData.car.currentLocation[1]}`;
        const pickupLocation = request.origin;

        const routeResponse = await fetch(`http://127.0.0.1:5000/route?origin=${carLocation}&destination=${pickupLocation}`, {
          method: 'GET',
        });
        const routeData = await routeResponse.json();

        if (routeData.encodedPolyline) {
          setEncodedPolyline(routeData.encodedPolyline);
        } else {
          console.error('Error fetching route polyline:', routeData.error || 'No encoded polyline provided');
        }
      }
    } catch (error) {
      console.error('Error processing ride request:', error);
    }
  };

  return (
    <div className="App">
      <div className="app-container">
        <MiniDrawer />
        <div className="map-wrapper">
          <MapComponent encodedPolyline={encodedPolyline} carLocation={carLocation} /> {/* Pass carLocation */}
          <div className="overlay-form">
            <RideRequestForm onSubmit={handleRideRequest} />
          </div>

          {vehicle && (
            <div>
              <AssignedVehicle vehicle={vehicle} arrivalTime={arrivalTime} />
            </div>
          )}

          {showRideDetails && (
            <div>
              <RideDetails origin={rideOrigin} destination={rideDestination} />
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
