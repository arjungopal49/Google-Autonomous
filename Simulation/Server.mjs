import express from "./node_modules/express/index.js";
import {setSpeed, freeUpCar, generateTraffic, getAllCars, query, removeTraffic, updateCar, getAllTraffic} from "./Database.mjs";
import cors from "cors"; // Import the CORS package

const app = express();
const port = 4000;

app.use(cors());
// Middleware to parse JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the car service API!');
});

// Endpoint to request a car
app.get('/request-car', async (req, res) => {
  try {
    const freeCar = await query();
    res.status(200).json(freeCar); // Send the car details as JSON response
  } catch (error) {
    res.status(500).json({ error: "Error while fetching car details." });
  }
});

// Endpoint to update car's location
app.post('/update-car', async (req, res) => {
  const { carId, x, y, status, locType } = req.body; // Expecting { destinationX, destinationY } from backend
  try {
    const result = await updateCar(carId, x, y, status, locType);
    res.status(200).send(); // Send 200 status code if the car location is updated successfully
  } catch (error) {
    res.status(500).json({ error: "Error while updating car." });
  }
});

// Endpoint to get the list of all cars (free and used)
app.get('/all-cars', async (req, res) => {
  try {
    const cars = await getAllCars();
    res.status(200).json(cars); // Send the car details as JSON response
  } catch (error) {
    res.status(500).json({ error: "Error while fetching car details." });
  }
});

//Endpoint to free up car after the ride is completed
app.post('/free-car', async (req, res) => {
  const { carId } = req.body;
  try {
    const result = await freeUpCar(carId);
      res.status(200).send();// Send 200 status code if the car is freed successfully
  } catch (error) {
    res.status(500).json({ error: "Error while freeing up car." });
  }
});

// accepts a JSON object with the following properties:
// {
//   "minLatLng": "43.072539203775506, -89.40189507477501",
//     "maxLatLng": "43.07167917359398, -89.40447893975805"
// }

//Endpoint to generate traffic
app.get('/generate-traffic', async (req, res) => {
  const { minLatLng, maxLatLng } = req.body;
  try {
    // Generate traffic
    const result = await generateTraffic(minLatLng, maxLatLng);
    res.status(200).send();// Send 200 status code if the traffic is generated successfully
  } catch (error) {
    res.status(500).json({ error: "Error while generating traffic." });
  }
});

// Endpoint to remove traffic
app.get('/remove-traffic', async (req, res) => {
  const { minLatLng, maxLatLng } = req.body;
  try {
    // Delete traffic
    const result = await removeTraffic(minLatLng, maxLatLng);
    res.status(200).send();// Send 200 status code if the traffic is deleted successfully
  } catch (error) {
    res.status(500).json({ error: "Error while deleting traffic." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/set_speed', async (req, res) => {
  const { speed } = req.body;
  try {
    const result = await setSpeed(speed);
      res.status(200).send();// Send 200 status code if the car is freed successfully
  } catch (error) {
    res.status(500).json({ error: "Error while freeing up car." });
  }
});

// Endpoint to get the list of all traffic
app.get('/all-traffic', async (req, res) => {
  try {
    const traffic = await getAllTraffic();
    res.status(200).json(traffic); // Send the traffic details as JSON response
  } catch (error) {
    res.status(500).json({ error: "Error while traffic car details." });
  }
});

