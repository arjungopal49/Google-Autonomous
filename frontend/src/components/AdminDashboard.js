import React, { useState, useEffect } from "react";
import MapComponentAdmin from './MapComponentAdmin';

const AdminDashboard = () => {
  const [refreshRateInput, setRefreshRateInput] = useState("");
  const [refreshRate, setRefreshRate] = useState(5);
  const [cars, setCars] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [minLatLng, setMinLatLng] = useState("");
  const [maxLatLng, setMaxLatLng] = useState("");
  const [carId, setCarId] = useState("");
  const [locationX, setLocationX] = useState("");
  const [locationY, setLocationY] = useState("");
  const [carStatus, setCarStatus] = useState("");
  const [speed, setSpeed] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all cars periodically
  useEffect(() => {
    const fetchAllCarsAndTraffic = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/get-all-cars`, {
          method: 'GET',
        });
        const carData = await response.json();
        console.log(carData)
        setCars(carData);

        const response2 = await fetch(`http://127.0.0.1:5000/get-all-traffic`, {
          method: 'GET',
        });
        const trafficData = await response2.json();
        console.log(trafficData)
        setTraffic(trafficData);
      } catch (error) {
        console.error("Error fetching cars and traffic:", error);
        setStatusMessage("Failed to fetch cars and traffic.");
      }
    };

    // Poll for car data every 5 seconds
    const intervalId = setInterval(fetchAllCarsAndTraffic, refreshRate*1000);
    fetchAllCarsAndTraffic(); // Initial fetch

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [refreshRate]);

  const updateCar = async () => {
    if (!carId || !locationX || !locationY || !carStatus) {
      setStatusMessage("Please fill in all car update fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/update-car?id=${carId}&location=${locationX+","+locationY}&type=coords&status=${carStatus}`,
        { method: 'POST' }
      );
      console.log(await response.json());
      setStatusMessage("Car updated successfully.");
    } catch (error) {
      console.error("Error updating car:", error);
      setStatusMessage("Failed to update car.");
    }
    setLoading(false);
  };

  const freeCar = async (carId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/free-car?id=${carId}`, {
        method: 'POST',
      });
      console.log(response.json());
      setStatusMessage("Car freed successfully.");
    } catch (error) {
      console.error("Error freeing car:", error);
      setStatusMessage("Failed to free car.");
    }
    setLoading(false);
  };

  const generateTraffic = async () => {
    if (!minLatLng || !maxLatLng) {
      setStatusMessage("Please enter both minimum and maximum coordinates.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/generate-traffic?minLatLng=${minLatLng.split(",").map(Number)}&maxLatLng=${maxLatLng.split(",").map(Number)}`,
        { method: 'POST' }
      );
      console.log(await response.json());
      setStatusMessage("Traffic generated successfully.");
    } catch (error) {
      console.error("Error generating traffic:", error);
      setStatusMessage("Failed to generate traffic.");
    }
    setLoading(false);
  };

  const removeTraffic = async () => {
    if (!minLatLng || !maxLatLng) {
      setStatusMessage("Please enter both minimum and maximum coordinates.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/remove-traffic?minLatLng=${minLatLng.split(",").map(Number)}&maxLatLng=${maxLatLng.split(",").map(Number)}`,
        { method: 'POST' }
      );
      console.log(await response.json());
      setStatusMessage("Traffic removed successfully.");
    } catch (error) {
      console.error("Error removing traffic:", error);
      setStatusMessage("Failed to remove traffic.");
    }
    setLoading(false);
  };

  const updateSpeed = async () => {
    if (!speed || isNaN(speed) || speed <= 0) {
      setStatusMessage("Please enter a valid positive speed.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/set-speed?speed=${speed}`, {
        method: 'POST',
      });
      console.log(response.json());
      setStatusMessage("Simulation speed updated.");
    } catch (error) {
      console.error("Error setting speed:", error);
      setStatusMessage("Failed to set speed.");
    }
    setLoading(false);
  };

  const updateRefresh = () => {
    if (!refreshRateInput || isNaN(refreshRateInput) || refreshRateInput <= 0) {
      setStatusMessage("Please enter a valid positive refresh rate.");
      return;
    }
    setRefreshRate(refreshRateInput)
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, borderRight: "1px solid #ddd" }}>
        {/* Pass cars data to the MapComponent */}
        <MapComponentAdmin allCars={cars} allTraffic={traffic}/>
      </div>
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h1>Admin Dashboard</h1>
        {loading && <p>Loading...</p>}

        <div>
          <h2>Cars List</h2>
          <ul>
            {cars.map((car) => (
              <li key={car._id}>
                ID: {car._id}, Status: {car.status}, Location: {car.currentLocation?.join(", ")}
                <button onClick={() => freeCar(car._id)}>Free Up</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Update Car</h2>
          <input
            type="text"
            placeholder="Car ID"
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Location X"
            value={locationX}
            onChange={(e) => setLocationX(e.target.value)}
          />
          <input
            type="number"
            placeholder="Location Y"
            value={locationY}
            onChange={(e) => setLocationY(e.target.value)}
          />
          <input
            type="text"
            placeholder="Status"
            value={carStatus}
            onChange={(e) => setCarStatus(e.target.value)}
          />
          <button onClick={updateCar}>Update Car</button>
        </div>

        <div>
          <h2>Traffic Management</h2>
          <input
            type="text"
            placeholder="Min LatLng (e.g., 43.07,-89.4)"
            value={minLatLng}
            onChange={(e) => setMinLatLng(e.target.value)}
          />
          <input
            type="text"
            placeholder="Max LatLng (e.g., 43.08,-89.39)"
            value={maxLatLng}
            onChange={(e) => setMaxLatLng(e.target.value)}
          />
          <button onClick={generateTraffic}>Generate Traffic</button>
          <button onClick={removeTraffic}>Remove Traffic</button>
        </div>

        <div>
          <h2>Set Simulation Speed</h2>
          <input
            type="number"
            placeholder="Enter speed (e.g., 1000)"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
          />
          <button onClick={updateSpeed}>Set Speed</button>
        </div>

        <div>
          <h2>Set Refresh Rate</h2>
          <input
            type="number"
            placeholder="Enter refresh rate"
            value={refreshRateInput}
            onChange={(e) => setRefreshRateInput(e.target.value)}
          />
          <button onClick={updateRefresh}>Set Rate</button>
        </div>

        {statusMessage && <p>{statusMessage}</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
