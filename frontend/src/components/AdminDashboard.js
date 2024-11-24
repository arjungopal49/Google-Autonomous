import React, { useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [cars, setCars] = useState([]);
  const [traffic, setTraffic] = useState({});
  const [speed, setSpeed] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const fetchAllCars = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:4000/all-cars");
      setCars(response.data);
    } catch (error) {
      console.error("Error fetching cars:", error);
      setStatusMessage("Failed to fetch cars.");
    }
  };

  const updateCar = async (carId, destinationX, destinationY, status) => {
    try {
      await axios.post("http://127.0.0.1:4000/update-car", {
        carId,
        destinationX,
        destinationY,
        status,
      });
      setStatusMessage("Car updated successfully.");
    } catch (error) {
      console.error("Error updating car:", error);
      setStatusMessage("Failed to update car.");
    }
  };

  const freeCar = async (carId) => {
    try {
      await axios.post("http://localhost:4000/free-car", { carId });
      setStatusMessage("Car freed successfully.");
    } catch (error) {
      console.error("Error freeing car:", error);
      setStatusMessage("Failed to free car.");
    }
  };

  const generateTraffic = async (minLatLng, maxLatLng) => {
    try {
      await axios.get("http://localhost:4000/generate-traffic", {
        data: { minLatLng, maxLatLng },
      });
      setStatusMessage("Traffic generated successfully.");
    } catch (error) {
      console.error("Error generating traffic:", error);
      setStatusMessage("Failed to generate traffic.");
    }
  };

  const removeTraffic = async (minLatLng, maxLatLng) => {
    try {
      await axios.get("http://localhost:4000/remove-traffic", {
        data: { minLatLng, maxLatLng },
      });
      setStatusMessage("Traffic removed successfully.");
    } catch (error) {
      console.error("Error removing traffic:", error);
      setStatusMessage("Failed to remove traffic.");
    }
  };

  const updateSpeed = async (worldSpeed) => {
    try {
      await axios.get("http://localhost:4000/set_speed", { data: { speed: worldSpeed } });
      setStatusMessage("Simulation speed updated.");
    } catch (error) {
      console.error("Error setting speed:", error);
      setStatusMessage("Failed to set speed.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <div>
        <button onClick={fetchAllCars}>Fetch All Cars</button>
        <h2>Cars List</h2>
        <ul>
          {cars.map((car) => (
            <li key={car._id}>
              ID: {car._id}, Status: {car.status}, Location:{" "}
              {car.currentLocation?.join(", ")}
              <button onClick={() => freeCar(car._id)}>Free Up</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Update Car</h2>
        <button
          onClick={() => updateCar("CAR_ID_HERE", 43.07, -89.4, "used")}
        >
          Update a Car
        </button>
      </div>
      <div>
        <h2>Traffic Management</h2>
        <button
          onClick={() =>
            generateTraffic(
              [43.072539203775506, -89.40189507477501],
              [43.07167917359398, -89.40447893975805]
            )
          }
        >
          Generate Traffic
        </button>
        <button
          onClick={() =>
            removeTraffic(
              [43.072539203775506, -89.40189507477501],
              [43.07167917359398, -89.40447893975805]
            )
          }
        >
          Remove Traffic
        </button>
      </div>
      <div>
        <h2>Set Simulation Speed</h2>
        <input
          type="number"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
        />
        <button onClick={() => updateSpeed(speed)}>Set Speed</button>
      </div>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default AdminDashboard;
