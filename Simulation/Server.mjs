import express from "./node_modules/express/index.js";
import {setSpeed, freeUpCar, generateTraffic, getAllCars, query, removeTraffic, updateCar} from "./Database.mjs";

const app = express();
const port = 4000;

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
  const { carId, destinationX, destinationY, status } = req.body; // Expecting { destinationX, destinationY } from backend
  try {
    const result = await updateCar(carId, destinationX, destinationY, status);
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

//Endpoint to generate traffic
app.get('/generate-traffic', async (req, res) => {
  const { traffic } = req.body;
  try {
    // Generate traffic
    const result = await generateTraffic(traffic);
    res.status(200).send();// Send 200 status code if the traffic is generated successfully
  } catch (error) {
    res.status(500).json({ error: "Error while generating traffic." });
  }
});

// Endpoint to remove traffic
app.get('/remove-traffic', async (req, res) => {
    const { traffic } = req.body;
  try {
    // Delete traffic
    const result = await removeTraffic(traffic);
    res.status(200).send();// Send 200 status code if the traffic is deleted successfully
  } catch (error) {
    res.status(500).json({ error: "Error while deleting traffic." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/set_Speed', async (req, res) => {
  const { speed } = req.body;
  try {
    const result = await setSpeed(speed);
      res.status(200).send();// Send 200 status code if the car is freed successfully
  } catch (error) {
    res.status(500).json({ error: "Error while freeing up car." });
  }
});

