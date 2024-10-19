import express from "./node_modules/express/index.js";
import { query, updateCar } from "./Database.mjs";

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
    console.log(freeCar);
    res.status(200).json(freeCar); // Send the car details as JSON response
  } catch (error) {
    res.status(500).json({ error: "Error while fetching car details." });
  }
});

// Endpoint to update car's location
app.post('/update-car', async (req, res) => {
  const { carId, destinationX, destinationY } = req.body; // Expecting { destinationX, destinationY } from backend
  try {
    const result = await updateCar(carId, destinationX, destinationY);
    res.status(200); // Send 200 status code if the car location is updated successfully
  } catch (error) {
    res.status(500).json({ error: "Error while updating car." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});