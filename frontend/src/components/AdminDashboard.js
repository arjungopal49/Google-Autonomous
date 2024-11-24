import React, { useState, useEffect } from "react";
import MapComponentAdmin from './MapComponentAdmin';
import axios from "axios";

const AdminDashboard = () => {
  const [cars, setCars] = useState([]);
  const [minLatLng, setMinLatLng] = useState("");
  const [maxLatLng, setMaxLatLng] = useState("");
  const [carId, setCarId] = useState("");
  const [destinationX, setDestinationX] = useState("");
  const [destinationY, setDestinationY] = useState("");
  const [carStatus, setCarStatus] = useState("");
  const [speed, setSpeed] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all cars periodically
  useEffect(() => {
    const fetchAllCars = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:4000/all-cars");
        setCars(response.data);
      } catch (error) {
        console.error("Error fetching cars:", error);
        setStatusMessage("Failed to fetch cars.");
      }
    };

    // Poll for car data every 5 seconds
    const intervalId = setInterval(fetchAllCars, 5000);
    fetchAllCars(); // Initial fetch

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const updateCar = async () => {
    if (!carId || !destinationX || !destinationY || !carStatus) {
      setStatusMessage("Please fill in all car update fields.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:4000/update-car", {
        carId,
        destinationX: parseFloat(destinationX),
        destinationY: parseFloat(destinationY),
        status: carStatus,
      });
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
      await axios.post("http://localhost:4000/free-car", { carId });
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
      await axios.get("http://localhost:4000/generate-traffic", {
        data: { minLatLng: minLatLng.split(",").map(Number), maxLatLng: maxLatLng.split(",").map(Number) },
      });
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
      await axios.get("http://localhost:4000/remove-traffic", {
        data: { minLatLng: minLatLng.split(",").map(Number), maxLatLng: maxLatLng.split(",").map(Number) },
      });
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
      await axios.get("http://localhost:4000/set_speed", { data: { speed: parseFloat(speed) } });
      setStatusMessage("Simulation speed updated.");
    } catch (error) {
      console.error("Error setting speed:", error);
      setStatusMessage("Failed to set speed.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, borderRight: "1px solid #ddd" }}>
        {/* Pass cars data to the MapComponent */}
        <MapComponentAdmin allCars={cars} />
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
            placeholder="Destination X"
            value={destinationX}
            onChange={(e) => setDestinationX(e.target.value)}
          />
          <input
            type="number"
            placeholder="Destination Y"
            value={destinationY}
            onChange={(e) => setDestinationY(e.target.value)}
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

        {statusMessage && <p>{statusMessage}</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
