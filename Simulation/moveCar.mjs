import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb';
import polylineCodec from '@googlemaps/polyline-codec';
import fetch from 'node-fetch';

const {decode} = polylineCodec;
import config from './config.js';


const username = encodeURIComponent("eksmith26");
const password = encodeURIComponent("Grace27$$");  // URL encoded password
const dbName = "Simu8";
const API_KEY = config.API_KEY;

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

// Cache for storing each car's route coordinates
const routeCache = {};

// Map to store state for each car using the car's ID as the key
const carStates = new Map();

// Function to move car progressively within a segment based on distance covered
function moveCarProgressively(start, end, distanceCovered, segmentDistance) {
    const ratio = distanceCovered / segmentDistance;
    return interpolate(start, end, Math.min(ratio, 1)); // Ensure ratio does not exceed 1
}


// Function to check if current coordinates of the car within the square of the traffic
async function checkTraffic(carLocation, traffic) {
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
            const { bottomLeft, bottomRight, topLeft, topRight } = rectangle;

            // Calculate boundaries
            const minLat = bottomLeft.lat;
            const maxLat = topLeft.lat;
            const minLng = bottomLeft.lng;
            const maxLng = bottomRight.lng;

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
    } finally {
        await client.close();
    }
}
async function updateCarLocation() {
    const database = client.db(dbName);
    const carsCollection = database.collection('Autonomous Cars');

    const query = {status: {$in: ["toUser", "ride"]}};
    const carsInUse = await carsCollection.find(query).toArray();

    for (let car of carsInUse) {
        let carId = car._id.toString(); // Ensure consistent ID tracking

        // Initialize state for each car if it doesn't exist
        if (!carStates.has(carId)) {
            carStates.set(carId, {
                currentSegmentIndex: 0,
                totalDistanceCovered: 0
            });
        }

        let carState = carStates.get(carId);

        // Fetch route if not cached
        if (!routeCache[carId]) {
            console.log(`Fetching route for car ${carId}`);
            let routeInfo = await fetchPolyline(`${car.currentLocation[0]},${car.currentLocation[1]}`, `${car.Destination[0]},${car.Destination[1]}`);
            routeCache[carId] = {
                coordinates: routeInfo[0],
                speed: routeInfo[1]
            };
        }

        const {coordinates, speed} = routeCache[carId];
        let {currentSegmentIndex, totalDistanceCovered} = carState;

        console.log(`Car ${carId} is moving...`);
        const start = car.currentLocation;
        const end = coordinates[currentSegmentIndex+1];
        console.log(`Start: ${start}, End: ${end}`);
        const segmentDistance = haversineDistance(start, end);

        totalDistanceCovered += speed * 1; // Assuming 1-second intervals
        const [newLat, newLng] = moveCarProgressively(start, end, totalDistanceCovered, segmentDistance);
        car.currentLocation = [Number(newLat.toFixed(7)), Number(newLng.toFixed(7))];
        console.log(`Car ${carId} position: (${newLat}, ${newLng})`);

        await carsCollection.updateOne(
            {_id: car._id},
            {$set: {currentLocation: car.currentLocation}}
        );

        if (totalDistanceCovered >= segmentDistance) {
            currentSegmentIndex += 1;
            totalDistanceCovered = 0;
        }
        // Update state in the Map for the next iteration
        carStates.set(carId, { currentSegmentIndex, totalDistanceCovered });

    }
}

(async () => {
    try {
        await client.connect();
        console.log("Connected to the database.");

        // Call updateCarLocation every second
        setInterval(async () => {
            try {
                await updateCarLocation();
            } catch (err) {
                console.error("An error occurred during update:", err);
            }
        }, 1000); // this is where to change the "how fast the world is moving"
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
        return [decodedPolyline, speed];

    } catch (error) {
        console.error(`Error in getRoute: ${error}`);
        return "error";
    }
}

