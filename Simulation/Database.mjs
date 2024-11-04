import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb';
import polylineCodec from '@googlemaps/polyline-codec';
const { decode } = polylineCodec;


const username = encodeURIComponent("eksmith26");
const password = encodeURIComponent("Grace27$$");  // URL encoded password
const dbName = "Simu8";
const API_KEY = "AIzaSyCzPvBLp1FInh8TivgxTr01GzsJO4S78VM";

const uri = `mongodb+srv://${username}:${password}@autosimulate.7qsly.mongodb.net/?retryWrites=true&w=majority&appName=AutoSimulate`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Create Car object which will be returned to the backend with the results from the query
let car = {
    id: null,
    currentLocation: [null, null], // Initialize with null indicating no value set yet
    destination: [null, null],     // Initialize with null as placeholder for future values
    inUse: "No"
};

// return an array of all free cars to backend
export async function query() {
    try {
        await client.connect();  // Ensure connection is established
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
        const query = {inUse: "No"};

        // Convert cursor to array so you can return the results
        const freeCars = await cars.find(query).toArray();
        console.log(freeCars);
        return freeCars;
    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        // Only close the client when you're done with all operations
        await client.close();
    }
}

// function to update car location picked by backend for the ride
export async function updateCar(carId, destinationX, destinationY) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
        console.log(carId);
        const filter = {_id: new ObjectId(carId)};
        const updateDoc = {
            $set: {
                "Destination.0": destinationX,
                "Destination.1": destinationY,
                "inUse": "Yes",
            },
        };

        const result = await cars.updateOne(filter, updateDoc);

        if (result.modifiedCount === 1) {
            console.log("Successfully updated one document.");
        } else {
            console.log("No documents matched the query. No update was made.");
        }

    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        await client.close();
    }
}

// return an array of all cars (free and used)
export async function getAllCars() {
    try {
        await client.connect();  // Ensure connection is established
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
        const allCars = await cars.find({}).toArray();
        return allCars;
    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        // Only close the client when you're done with all operations
        await client.close();
    }
}

// function to free up car after the ride is completed. takes in carId and change the inuse status to No
export async function freeUpCar(carId) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
        //console.log(carId);
        const filter = {_id: new ObjectId(carId)};
        const updateDoc = {
            $set: {
                inUse: "No"
            },
        };

        const result = await cars.updateOne(filter, updateDoc);

        if (result.modifiedCount === 1) {
            console.log("Successfully updated one document.");
        } else {
            console.log("No documents matched the query. No update was made.");
        }
    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        await client.close();
    }
}

// Cache for storing each car's route coordinates
const routeCache = {};

// Tolerance for destination proximity check
const tolerance = 0.0001;

async function updateCarLocation() {
    const database = client.db(dbName);
    const carsCollection = database.collection('Autonomous Cars');

    const query = { inUse: "Yes" };
    const carsInUse = await carsCollection.find(query).toArray();

    // Track active cars and interval IDs
    let activeCars = carsInUse.length;
    const intervalIds = [];

    console.log(`Starting location update for ${activeCars} cars in use.`);

    // Loop through each car in use
    for (let car of carsInUse) {
        let carId = car._id;

        // Check if the route is already cached
        if (!routeCache[carId]) {
            console.log(`Fetching route for car ${carId}`);
            let routeInfo = await fetchPolyline(`${car.currentLocation[0]},${car.currentLocation[1]}`, `${car.Destination[0]},${car.Destination[1]}`);
            routeCache[carId] = routeInfo[0]; // Store only the coordinates array
        }

        const coordinates = routeCache[carId];
        let coordinateIndex = 0;

        // Set up an interval for each car
        const intervalId = setInterval(async () => {
            if (coordinateIndex >= coordinates.length) {
                console.log(`Car ${carId} has reached the final coordinate.`);
                clearInterval(intervalId);
                activeCars--;

                await carsCollection.updateOne(
                    { _id: carId },
                    { $set: { inUse: "No" } }
                );
                
                delete routeCache[carId];

                if (activeCars === 0) {
                    console.log("All cars have reached their destinations. Closing database connection.");
                    await client.close();
                }
                return;
            }

            const [newLat, newLng] = coordinates[coordinateIndex];
            car.currentLocation = [newLat, newLng];
            console.log(`Car ${carId} position: (${newLat.toFixed(5)}, ${newLng.toFixed(5)})`);

            await carsCollection.updateOne(
                { _id: carId },
                { $set: { currentLocation: car.currentLocation } }
            );
            
            coordinateIndex += 1;
        }, 1000);

        intervalIds.push(intervalId);
    }
}

// Connect to the database once, then start updating car locations
(async () => {
    try {
        await client.connect();
        console.log("Connected to the database.");
        await updateCarLocation();
    } catch (err) {
        console.error("An error occurred:", err);
        await client.close();
    }
})();


// Helper function to fetch the polyline from Google Maps API
async function fetchPolyline(origin, destination) {
  if (!origin || !destination || origin === 'undefined' || destination === 'undefined') {
    return "error";
  }

  try {
    // Parse the coordinates
    const [originLat, originLng] = origin.split(',').map(Number);
    const [destLat, destLng] = destination.split(',').map(Number);

    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,  
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
    };

    const body = JSON.stringify({
        origin: {
            location: {
                latLng: {
                    latitude: originLat,
                    longitude: originLng
                }
            }
        },
        destination: {
            location: {
                latLng: {
                    latitude: destLat,
                    longitude: destLng
                }
            }
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
    });

    if (!response.ok) {
        return "error";
    }

    const data = await response.json();
    
    const encodedPolyline = data.routes[0].polyline.encodedPolyline;
    const distance = data.routes[0].distanceMeters; // total distance in meters 
    const time = parseInt(data.routes[0].duration, 10); // base 10
    const decodedPolyline = decode(encodedPolyline);
    return [ decodedPolyline, time, distance ];

  } catch (error) {
    console.error(`Error in getRoute: ${error}`);
    return "error";
  }
}


