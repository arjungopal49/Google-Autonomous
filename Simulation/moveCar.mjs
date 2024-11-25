import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb';
import polylineCodec from '@googlemaps/polyline-codec';
import fetch from 'node-fetch';
import fs from 'fs/promises';

const {decode} = polylineCodec;
import config from './config.js';
import { read } from 'fs';


const username = encodeURIComponent("eksmith26");
const password = encodeURIComponent("Grace27$$");  // URL encoded password
const dbName = "Simu8";
const API_KEY = config.API_KEY;
let randomName = null;

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
    status: "free"
};


let worldSpeed = 1000;

// Cache for storing each car's route coordinates
const routeCache = {};

// Map to store state for each car using the car's ID as the key
const carStates = new Map();


async function readFirstLine() {
    try {
        // Read the file content
        const data = await fs.readFile('./collectionName.txt', 'utf8');
        
        // Split the file content into lines and get the first line
        const firstLine = data.split('\n')[0].trim();
        
        // Assign the first line to randomName
        randomName = firstLine;
        
        console.log(`First line read from file: '${randomName}'`);
        return randomName; // Return the value if needed elsewhere
    } catch (err) {
        console.error(`Error reading file :`, err);
        throw err; // Rethrow error if additional handling is needed
    }
}

// Function to calculate distance between two coordinates using the haversine formula
function haversineDistance([x1, y1], [x2, y2]) {
    const R = 6371000; // Radius of Earth in meters
    const toRadians = (deg) => deg * (Math.PI / 180);
    const dLat = toRadians(x2 - x1);
    const dLng = toRadians(y2 - y1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(x1)) * Math.cos(toRadians(x2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to interpolate between two coordinates based on a ratio
function interpolate([x1, y1], [x2, y2], ratio) {
    const x = x1 + (x2 - x1) * ratio;
    const y = y1 + (y2 - y1) * ratio;
    return [Number(x.toFixed(7)), Number(y.toFixed(7))];

}


// Function to check if current coordinates of the car within the square of the traffic
async function checkTraffic(carLocation) {
    try {
        // Connect to the MongoDB client
        await client.connect();
        const database = client.db(dbName);
        const traffic = database.collection('Traffic');

        // Fetch all traffic squares from the database
        const rectangles = await traffic.find().toArray();

        const [carLat, carLng] = carLocation;
        let isCarInTraffic = false;

        // Check if the car is within any of the rectangles
        for (const rectangle of rectangles) {
            const { minLatLng, maxLatLng } = rectangle;

            // Parse the minLatLng and maxLatLng string into separate lat, lng values
            const [minLat, minLng] = minLatLng.split(",").map(parseFloat);
            const [maxLat, maxLng] = maxLatLng.split(",").map(parseFloat);

            // Check if the car's location is within the bounds of the current rectangle
            if (
                carLat >= minLat && carLat <= maxLat && // Latitude range check
                carLng >= minLng && carLng <= maxLng    // Longitude range check
            ) {
                isCarInTraffic = true;
                break; // Exit the loop once a match is found
            }
        }

        console.log(`Car is ${isCarInTraffic ? 'in' : 'not in'} traffic.`);
        return isCarInTraffic;
    } catch (err) {
        console.error("An error occurred while checking traffic:", err);
        return false;
    }
}


async function updateCarLocation() {
    const database = client.db(dbName);
    const carsCollection = database.collection(randomName);

    // Query for cars that are currently moving (toUser or ride status)
    const query = { status: { $in: ["toUser", "ride"] } };
    const carsInUse = await carsCollection.find(query).toArray();
    for (let car of carsInUse) {
        const carId = car._id.toString();

        // Initialize state for the car if not already set
        if (!carStates.has(carId)) {
            carStates.set(carId, {
                currentSegmentIndex: 0,
                segmentDistanceCovered: 0,
            });
        }

        let carState = carStates.get(carId);

        // Fetch and cache the route if not already done
        if (!routeCache[carId]) {
            console.log(`Fetching route for car ${carId}`);
            let routeInfo = await fetchPolyline(`${car.currentLocation[0]},${car.currentLocation[1]}`, `${car.Destination[0]},${car.Destination[1]}`);

            if (routeInfo === "error") {
                console.error(`Failed to fetch route for car ${carId}`);
                continue;
            }
            await carsCollection.updateOne(
                { _id: car._id },
                {
                    $set: { // Use `$set` to update fields
                        polyline: routeInfo[2]
                    }
                }
            );


            routeCache[carId] = {
                coordinates: routeInfo[0], // Decoded polyline coordinates
                speed: routeInfo[1],       // Speed in meters per second
            };
        }

        // Get the current coordinated of the car
        const carLocation = car.currentLocation;

        // Check if the car is in traffic
        const isInTraffic = await checkTraffic(carLocation);

        let { coordinates, speed } = routeCache[carId];
        const { currentSegmentIndex, segmentDistanceCovered } = carState;

        if (isInTraffic) {
            console.log(`Car ${carId} is in traffic. Waiting...`);
            speed = speed / 2; // Reduce speed by half when in traffic
        }
        // Current and next coordinates
        const start = coordinates[currentSegmentIndex];
        const end = coordinates[currentSegmentIndex + 1];
        const segmentDistance = haversineDistance(start, end);


        // Update distance covered in the current segment
        const distanceToMove = speed; // Distance to move in this interval
        let updatedDistance = segmentDistanceCovered + distanceToMove;

        // Handle segment transitions
        let newSegmentIndex = currentSegmentIndex;
        while (updatedDistance >= segmentDistance) {
            updatedDistance -= segmentDistance;
            newSegmentIndex++;

            // If we've reached the final segment
            if (newSegmentIndex >= coordinates.length - 1) {
                console.log(`Car ${carId} has reached its destination.`);
                delete routeCache[carId];
                carStates.delete(carId);

                const newStatus = car.status === "toUser" ? "waiting" : "free";
                await carsCollection.updateOne(
                    { _id: car._id },
                    {
                        $set: { // Use `$set` to update fields
                            status: newStatus,
                            polyline: null,
                            speed: 0
                        }
                    }
                );
                if (newStatus === 'free') {
                    return;
                }
                continue;
              
            }
        }
        
        // Calculate the new position
        const newStart = coordinates[newSegmentIndex];
        const newEnd = coordinates[newSegmentIndex + 1];
        const newSegmentDistance = haversineDistance(newStart, newEnd);
        const ratio = updatedDistance / newSegmentDistance;
        const [newLat, newLng] = interpolate(newStart, newEnd, ratio);

        // Update the car's location
        car.currentLocation = [newLat, newLng];
        console.log(`Car ${carId} moved to: (${newLat}, ${newLng})`);

        await carsCollection.updateOne(
            { _id: car._id },
            { $set: {
                        currentLocation: car.currentLocation,
                        speed: speed
                }
            }
        );

        // Update car state for the next iteration
        carStates.set(carId, {
            currentSegmentIndex: newSegmentIndex,
            segmentDistanceCovered: updatedDistance,
        });
    }
}

readFirstLine(); 

async function mainLoop() {
    while (true) {
        try {
            await fetchWorldSpeed(); // Ensure worldSpeed is updated
            await updateCarLocation(); // Update car locations
        } catch (err) {
            console.error("An error occurred during update:", err);
        }
        await new Promise(resolve => setTimeout(resolve, worldSpeed)); // Use the latest worldSpeed dynamically
    }
}

// Connect to the database and start the main loop
(async () => {
    try {
        await client.connect();
        console.log("Connected to the database.");
        await readFirstLine(); // Load randomName from file
        mainLoop(); // Start the main loop
    } catch (err) {
        console.error("An error occurred while connecting:", err);
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
        console.log('Received data:', data);
        console.log('Routes:', data.routes);
        if (!data.routes || !data.routes.length) {
            console.error('No routes returned from API');
            return 'error';
        }

        const encodedPolyline = data.routes[0].polyline.encodedPolyline;
        const distance = data.routes[0].distanceMeters; // total distance in meters
        const time = parseInt(data.routes[0].duration, 10); // base 10
        const decodedPolyline = decode(encodedPolyline);
        const speed = distance / time;
        return [decodedPolyline, speed, encodedPolyline];

    } catch (error) {
        console.error(`Error in getRoute: ${error}`);
        return "error";
    }
}

export async function fetchWorldSpeed() {
    try {
        await client.connect();
        const database = client.db(dbName);
        const worldSpeedCollection = database.collection('WorldSpeed');

        // Fetch the current worldSpeed value
        const result = await worldSpeedCollection.findOne({});
        if (result && result.worldSpeed) {
            worldSpeed = result.worldSpeed; // Update the global variable
        } else {
            console.log("worldSpeed document not found. Using default value.");
        }
    } catch (err) {
        console.error("Error fetching worldSpeed:", err);
    }
}