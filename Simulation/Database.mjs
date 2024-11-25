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
export async function updateCar(carId, destinationX, destinationY, status) {
    try {
        await connectClient();
        const database = client.db(dbName);
        const cars = database.collection(randomName);
        console.log(carId);
        const filter = {_id: new ObjectId(carId)};
        destinationX = Number(destinationX)
        destinationY = Number(destinationY)
        destinationX = Number(destinationX.toFixed(7));
        destinationY = Number(destinationY.toFixed(7));
        const updateDoc = {
            $set: {
                "Destination.0": destinationX,
                "Destination.1": destinationY,
                "status": status,
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
                status: "free"
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


// stores the coordinates of the rectangle which has traffic in the database
export async function generateTraffic(minLatLng, maxLatLng){
    try{
        await connectClient();
        const database = client.db(dbName);
        const traffic = database.collection('Traffic');
        // Create a rectangle object to store in the database
        const rectangleData = {
            minLatLng: minLatLng,       // Bottom-left corner
            maxLatLng: maxLatLng        // Top-right corner
        };
        // Insert the rectangle into the database
        const result = await traffic.insertOne(rectangleData);
        console.log("Traffic generated successfully");
    }
    catch(err){
        console.error("An error occurred:", err);
    }
}

// function to remove traffic from the database
export async function removeTraffic(minLatLng, maxLatLng) {
    try {
        await connectClient();
        const database = client.db(dbName);
        const traffic = database.collection('Traffic');
        // Define a query to match traffic entries with the specified coordinates
        const query = {
            minLatLng: minLatLng,
            maxLatLng: maxLatLng
        };
        const result = await traffic.deleteMany(query);
        console.log("Traffic removed successfully");
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
setupGracefulShutdown(); // Setup cleanup process on shutdown
