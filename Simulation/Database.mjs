import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb';
import fs from 'fs/promises';

const username = encodeURIComponent("eksmith26");
const password = encodeURIComponent("Grace27$$");  // URL encoded password
const dbName = "Simu8";

const uri = `mongodb+srv://${username}:${password}@autosimulate.7qsly.mongodb.net/?retryWrites=true&w=majority&appName=AutoSimulate`;
let randomName = null;
let isConnected = false;

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

async function connectClient() {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
        console.log("Connected to database");
    }
}

// return an array of all free cars to backend
export async function query() {
    try {
        await connectClient();  // Ensure connection is established
        const database = client.db(dbName);
        const cars = database.collection(randomName);
        const query = {status: "free"};

        // Convert cursor to array so you can return the results
        const freeCars = await cars.find(query).toArray();
        console.log(freeCars);
        return freeCars;
    } catch (err) {
        console.error("An error occurred:", err);
    }
}

// function to update car location picked by backend for the ride
export async function updateCar(carId, x, y, status, locType) {
    try {
        await connectClient();
        const database = client.db(dbName);
        const cars = database.collection(randomName);
        console.log(carId);
        const filter = {_id: new ObjectId(carId)};
        x = Number(x)
        y = Number(y)
        x = Number(x.toFixed(7));
        y = Number(y.toFixed(7));

        let updateDoc;
        if (locType === "destination") {
            updateDoc = {
                $set: {
                    "Destination.0": x,
                    "Destination.1": y,
                    "status": status,
                },
            };
        } else {
            updateDoc = {
                $set: {
                    "currentLocation.0": x,
                    "currentLocation.1": y,
                    "status": status,
                },
            };
        }

        const result = await cars.updateOne(filter, updateDoc);

        if (result.modifiedCount === 1) {
            console.log("Successfully updated one document.");
        } else {
            console.log("No documents matched the query. No update was made.");
        }

    } catch (err) {
        console.error("An error occurred:", err);
    }
}

// return an array of all cars (free and used)
export async function getAllCars() {
    try {
        await connectClient(); // Ensure connection is established
        const database = client.db(dbName);
        const cars = database.collection(randomName);
        const allCars = await cars.find({}).toArray();
        return allCars;
    } catch (err) {
        console.error("An error occurred:", err);
    }
}

// function to free up car after the ride is completed. takes in carId and change the status to free
export async function freeUpCar(carId) {
    try {
        await connectClient();
        const database = client.db(dbName);
        const cars = database.collection(randomName);
        //console.log(carId);
        const filter = {_id: new ObjectId(carId)};
        const updateDoc = {
            $set: {
                status: "free",
                Destination: [null, null],
                speed: 0,
                polyline: null
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
    }
}


export async function generateTraffic(minLatLng, maxLatLng) {
    try {
        await connectClient();
        const database = client.db(dbName);
        const traffic = database.collection('Traffic');

        // Parse input coordinates
        const [minLat, minLng] = minLatLng.split(',').map(parseFloat);
        const [maxLat, maxLng] = maxLatLng.split(',').map(parseFloat);

        // Create a GeoJSON polygon for the traffic rectangle
        const rectangleGeoJSON = {
            type: "Polygon",
            coordinates: [[
                [minLng, minLat],  // Bottom-left
                [maxLng, minLat],  // Bottom-right
                [maxLng, maxLat],  // Top-right
                [minLng, maxLat],  // Top-left
                [minLng, minLat]   // Close the loop
            ]]
        };

        // Insert the rectangle into the database
        const result = await traffic.insertOne({
            geometry: rectangleGeoJSON
        });

        console.log("Traffic generated successfully with ID:", result.insertedId);
    } catch (err) {
        console.error("An error occurred:", err);
    }
}


// function to remove traffic from the database
export async function removeTraffic(minLatLng, maxLatLng) {
    try {
        await connectClient();
        const database = client.db(dbName);
        const traffic = database.collection('Traffic');
        // Parse input coordinates
        const [minLat, minLng] = minLatLng.split(',').map(parseFloat);
        const [maxLat, maxLng] = maxLatLng.split(',').map(parseFloat);

        // Define the query to remove traffic entries based on the bounding box (rectangle)
        const query = {
            "geometry": {
                $geoWithin: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [minLng, minLat],  // Bottom-left
                                [maxLng, minLat],  // Bottom-right
                                [maxLng, maxLat],  // Top-right
                                [minLng, maxLat],  // Top-left
                                [minLng, minLat]   // Close the loop
                            ]
                        ]
                    }
                }
            }
        };


        // Remove traffic entries matching the defined coordinates
        const result = await traffic.deleteMany(query);
        if (result.deletedCount > 0) {
            console.log(`${result.deletedCount} traffic entries removed successfully.`);
        } else {
            console.log("No traffic entries found in the specified area.");
        }
    } catch (err) {
        console.error("An error occurred:", err);
    }
}

  
export async function setSpeed(newSpeed) {
    try {
        if (newSpeed <= 0) throw new Error("Speed must be greater than 0"); // Validate input

        // Calculate the new world speed
        const howFastWorldMoves = 1000 / newSpeed;

        // Ensure the database is connected
        await connectClient();
        const database = client.db(dbName);
        const worldSpeedCollection = database.collection('WorldSpeed');

        // Update the worldSpeed value in the database
        const result = await worldSpeedCollection.updateOne(
            {}, // Query to match the document (leave empty to match all)
            { $set: { worldSpeed: howFastWorldMoves } }, // Update the worldSpeed value
            { upsert: true } // Create a new document if it doesn't exist
        );
        console.log("World Speed set successfully");
    } catch (err) {
        console.error("An error occurred:", err);
    }
}

// return an array of traffic
export async function getAllTraffic() {
    try {
        await connectClient(); // Ensure connection is established
        const database = client.db(dbName);
        const traffic = database.collection('Traffic');
        const allTraffic= await traffic.find({}).toArray();
        return allTraffic;
    } catch (err) {
        console.error("An error occurred:", err);
    }
}

export async function setAllInTrafficStatus() {
    try {
        await connectClient();
        const database = client.db(dbName);
        const carsCollection = database.collection(randomName);
        const trafficCollection = database.collection('Traffic');

        const allCars = await carsCollection.find({}).toArray();

        // Use Promise.all to execute updates concurrently for better performance
        await Promise.all(allCars.map(async (car) => {
            const [lat, lng] = car.currentLocation;

            // Check if the car is within traffic
            const result = await trafficCollection.findOne({
                geometry: {
                    $geoIntersects: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lng, lat]
                        }
                    }
                }
            });

            // Update the car's traffic status
            await carsCollection.updateOne(
                { _id: car._id },
                { $set: { isInTraffic: !!result } } // `!!result` converts result to a boolean
            );
        }));
        
    } catch (err) {
        console.error("An error occurred:", err);
    }
}

// Graceful shutdown for closing MongoDB client
function setupGracefulShutdown() {
    process.on('SIGINT', async () => {
        try {
            await client.close();
            console.log("MongoDB client closed gracefully on SIGINT");
        } catch (err) {
            console.error("Error during MongoDB client shutdown", err);
        } finally {
            process.exit(0);
        }
    });

    process.on('SIGTERM', async () => {
        try {
            await client.close();
            console.log("MongoDB client closed gracefully on SIGTERM");
        } catch (err) {
            console.error("Error during MongoDB client shutdown", err);
        } finally {
            process.exit(0);
        }
    });
}
readFirstLine();   


async function createIndex() {

    try {
        await connectClient();
        const database = client.db(dbName);
        const collection = database.collection("Traffic");

        // Create an index
        const result = await collection.createIndex({ geometry: "2dsphere" });
        console.log(`Index created: ${result}`);
    } catch (error) {
        console.error("Error creating index:", error);
    }
}


setupGracefulShutdown(); // Setup cleanup process on shutdown
