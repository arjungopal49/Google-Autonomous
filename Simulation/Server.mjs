import express from "./node_modules/express/index.js";
import {setSpeed, freeUpCar, generateTraffic, getAllCars, query, removeTraffic, updateCar, getAllTraffic, setAllInTrafficStatus} from "./Database.mjs";
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


//          *-----------------*maxLatLong
//           |  x          x  |
//           |      x         |
//           |             x  |
//           |   x            |
//  minLatLng*----------------*
//
//

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

app.post('/set_speed', async (req, res) => {
  const { speed } = req.body; // Use req.body to read POST parameters
  try {
    if (!speed) {
      throw new Error("Speed parameter is missing");
    }
    const result = await setSpeed(Number(speed)); // Convert speed to a number
    res.status(200).json({
      message: "Speed updated successfully",
      updatedSpeed: result,
    }); // Send confirmation and updated speed
  } catch (error) {
    res.status(500).json({ error: error.message }); // Send error message if something goes wrong
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
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

//Endpoint to set the in traffic status of all cars based on their locations
app.post('/set-in-traffic-status', async (req, res) => {
  try {
    const result = await setAllInTrafficStatus();
      res.status(200).send();// Send 200 status code if done successfully
  } catch (error) {
    res.status(500).json({ error: "Error while setting in traffic variable." });
  }
});
