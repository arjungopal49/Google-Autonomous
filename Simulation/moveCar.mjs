import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb';
import polylineCodec from '@googlemaps/polyline-codec';
const { decode } = polylineCodec;


const username = encodeURIComponent("eksmith26");
const password = encodeURIComponent("Grace27$$");  // URL encoded password
const dbName = "Simu8";
const API_KEY = "AIzaSyCDNOcShPLnjKVBPl5CGFWoGV6IzW3QDy8";


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
    return [x, y];
}

// Cache for storing each car's route coordinates
const routeCache = {};

// Function to move car progressively within a segment based on distance covered
function moveCarProgressively(start, end, distanceCovered, segmentDistance) {
    const ratio = distanceCovered / segmentDistance;
    return interpolate(start, end, Math.min(ratio, 1)); // Ensure ratio does not exceed 1
}

// Updated updateCarLocation function without internal intervals
async function updateCarLocation() {
    const database = client.db(dbName);
    const carsCollection = database.collection('Autonomous Cars');

    const query = { inUse: "Yes" };
    const carsInUse = await carsCollection.find(query).toArray();

    let activeCars = carsInUse.length;
    console.log(`Starting location update for ${activeCars} cars in use.`);

    for (let car of carsInUse) {
        let carId = car._id;

        // Fetch route if not cached
        if (!routeCache[carId]) {
            console.log(`Fetching route for car ${carId}`);
            let routeInfo = await fetchPolyline(`${car.currentLocation[0]},${car.currentLocation[1]}`, `${car.Destination[0]},${car.Destination[1]}`);
            routeCache[carId] = {
                coordinates: routeInfo[0], // Store the coordinates array
                speed: routeInfo[1] // Store the speed (you can modify this value as needed)
            };
        }

        const coordinates = routeCache[carId].coordinates;
        let currentSegmentIndex = car.currentSegmentIndex || 0; // Track current segment for each car
        let totalDistanceCovered = car.totalDistanceCovered || 0; // Track distance covered in segment
        const speed = routeCache[carId].speed; // Car speed in meters per second
        const intervalTime = 1; // Update interval in seconds

        if (currentSegmentIndex >= coordinates.length - 1) {
            console.log(`Car ${carId} has reached the final coordinate.`);
            activeCars--;

            await carsCollection.updateOne(
                { _id: carId },
                { $set: { inUse: "No" } }
            );

            delete routeCache[carId];

            if (activeCars === 0) {
                console.log("All cars have reached their destinations");
                //await client.close(); // Keep open for ongoing updates
            }
            continue;
        }

        const start = car.currentLocation; // Set start as the car's current location
        const end = coordinates[currentSegmentIndex];
        const segmentDistance = haversineDistance(start, end);

        // Calculate distance covered within the current segment
        totalDistanceCovered += speed * intervalTime;
        const [newLat, newLng] = moveCarProgressively(start, end, totalDistanceCovered, segmentDistance);
        car.currentLocation = [newLat, newLng];
        console.log(`Car ${carId} position: (${newLat}, ${newLng})`);

        // Update car's location in the database
        await carsCollection.updateOne(
            { _id: carId },
            { $set: { 
                currentLocation: car.currentLocation,
                currentSegmentIndex,
                totalDistanceCovered
            }}
        );

        // Check if the car reached the end of the segment
        if (totalDistanceCovered >= segmentDistance) {
            currentSegmentIndex += 1; // Move to the next segment
            totalDistanceCovered = 0; // Reset the distance covered within the segment
        }
    }
}

// Connect to the database once, then start the interval to update car locations every second
(async () => {
    try {
        await client.connect();
        console.log("Connected to the database.");

        // Run updateCarLocation every 1 second
        setInterval(async () => {
            try {
                await updateCarLocation();
            } catch (err) {
                console.error("An error occurred during update:", err);
            }
        }, 1000); // 1000 milliseconds = 1 second

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
        console.error("Error: Received non-OK response from API:", response.status, response.statusText);
        return "error";
      }
  
    const data = await response.json();
    console.log(data);
    console.log("Received data from Google Maps API:", data);
      
    const encodedPolyline = data.routes[0].polyline.encodedPolyline;
    const distance = data.routes[0].distanceMeters; // total distance in meters 
    const time = parseInt(data.routes[0].duration, 10); // base 10
    const decodedPolyline = decode(encodedPolyline);
    const speed = distance / time; 
    console.log(decodedPolyline);
    return [ decodedPolyline, speed ];

  } catch (error) {
    console.error(`Error in getRoute: ${error}`);
    return "error";
  }
}


