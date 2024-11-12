import React, { useState, useEffect } from 'react';
import './App.css';
import RideRequestForm from './components/RideRequestForm';
import MiniDrawer from './components/Sidebar';
import MapComponent from './components/MapComponent';
import AssignedVehicle from './components/AssignedVehicle';
import RideDetails from './components/RideDetails';
import CarArrived from './components/CarArrived';

function App() {
  const [vehicle, setVehicle] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [encodedPolyline, setEncodedPolyline] = useState(null);
  const [rideOrigin, setRideOrigin] = useState('');
  const [rideDestination, setRideDestination] = useState('');
  const [showRideDetails, setShowRideDetails] = useState(false);
  const [carLocation, setCarLocation] = useState(null); // New state for car location
  const [carDest, setCarDest] = useState(null);
  const [allCars, setAllCars] = useState([]); // state for list of all cars (to display on main map)
  const [showCarArrived, setShowCarArrived] = useState(false);

  useEffect(() => {
    async function getAllCars() {
      const response = await fetch(`http://127.0.0.1:5000/get-all-cars`, {
        method: 'GET',
      });
      const carData = await response.json();
      setAllCars(carData)
    }

    async function trackProgress() {
      const response = await fetch(`http://127.0.0.1:5000/track-progress?id=${vehicle._id}`, {
        method: 'GET',
      });
      const progress = await response.json();
      
      if (progress.car.status === "free") {
        setCarLocation(null);
        setEncodedPolyline(null);
        setVehicle(null);
        setShowRideDetails(false);
      } else {
        setVehicle(progress.car);
        setCarLocation(progress.car.currentLocation);
        setArrivalTime(progress['remaining-time']);
        setCarDest(progress.car.Destination);
        if (progress.car.status === "waiting") {
          setEncodedPolyline(null);
          setShowCarArrived(true);
        } else {
          setEncodedPolyline(progress["remaining-route"]);
        }
      }
    }

    let intervalId;
    if (carLocation) {
      intervalId = setInterval(trackProgress, 5000);  // Fetch every 5 seconds
    } else {
      intervalId = setInterval(getAllCars, 5000); // Fetch every 5 seconds
    }
    return () => clearInterval(intervalId); 
  }, [carLocation]);

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

  const handleStartRide = async() => {
    const response = await fetch(`http://127.0.0.1:5000/start-ride?id=${vehicle["_id"]}&destination=${rideDestination}`, {
      method: 'POST',
    });
    console.log(response.json())
    setShowCarArrived(false);
  }

  return (
    <div className="App">
      <div className="app-container">
        <MiniDrawer />
        <div className="map-wrapper">
          <MapComponent encodedPolyline={encodedPolyline} carLocation={carLocation} carDest={carDest} allCars={allCars}/> {/* Pass carLocation */}
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

          {showCarArrived && (
            <div>
              <CarArrived startRide={handleStartRide} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
