import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs/promises';

const username = encodeURIComponent("eksmith26");
const password = encodeURIComponent("Grace27$$"); // URL encoded password
const dbName = "Simu8";

const uri = `mongodb+srv://${username}:${password}@autosimulate.7qsly.mongodb.net/?retryWrites=true&w=majority&appName=AutoSimulate`;

const now = new Date();
const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const formattedTime = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

let randomName = `Collection_${formattedDate}_${formattedTime}_${Math.random().toString(36).substring(2, 10)}`; // Update the global variable

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let isConnected = false;

async function connectClient() {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
        console.log("Database connected.");
    }
}

async function createCollection() {
    const numCars = 5, // Default to 5 cars
        minLatLng = { lat: 43.067945, lng: -89.414198 }, // Default minimum coordinates
        maxLatLng = { lat: 43.074954, lng: -89.393653 };
    try {
        await connectClient(); // Ensure the database connection is established
        const database = client.db(dbName);

        // Define the initial data
        const initialData = Array.from({ length: numCars }, () => {
            const randomCurrentLat = (Math.random() * (maxLatLng.lat - minLatLng.lat) + minLatLng.lat).toFixed(6);
            const randomCurrentLng = (Math.random() * (maxLatLng.lng - minLatLng.lng) + minLatLng.lng).toFixed(6);
            const randomDestinationLat = (Math.random() * (maxLatLng.lat - minLatLng.lat) + minLatLng.lat).toFixed(6);
            const randomDestinationLng = (Math.random() * (maxLatLng.lng - minLatLng.lng) + minLatLng.lng).toFixed(6);

            return {
                currentLocation: [parseFloat(randomCurrentLat), parseFloat(randomCurrentLng)],
                Destination: [parseFloat(randomDestinationLat), parseFloat(randomDestinationLng)],
                currentSegmentIndex: 0,
                totalDistanceCovered: 0,
                status: "free",
                polyline: "",
                speed: 0,
                isInTraffic: false,
            };
        });

        // Create the collection
        const collection = await database.createCollection(randomName);

        // Insert the initial data
        await collection.insertMany(initialData);
    } catch (err) {
        console.error("An error occurred while creating the collection:", err);
    }
}

export async function removeCollection() {
    try {
        await connectClient(); // Ensure the database connection is established
        const database = client.db(dbName);

        // Drop the collection
        await database.collection(randomName).drop();
        console.log(`Collection '${randomName}' removed successfully.`);
    } catch (err) {
        if (err.codeName === "NamespaceNotFound") {
            console.log(`Collection '${randomName}' does not exist.`);
        } else {
            console.error("An error occurred while removing the collection:", err);
        }
    }
}

(async function main() {
    const filePath = './collectionName.txt';

    try {
        await connectClient(); // Ensure the database connection is established
        console.log("Connected to the database.");

        const collectionName = randomName; // Use the globally defined randomName
        console.log(`Attempting to create collection: '${collectionName}'`);

        await createCollection(); // Create the collection and insert initial data
        console.log(`Collection '${collectionName}' created successfully.`);

        // Save randomName to a new file
        await fs.writeFile(filePath, collectionName, 'utf8');
        console.log(`Collection name '${collectionName}' saved to file '${filePath}'.`);
    } catch (err) {
        console.error("Error during collection creation or initialization:", err);
    }

    // Graceful shutdown logic
    process.on('SIGINT', async () => {
        console.log("\nSIGINT received. Cleaning up...");
        await cleanup(filePath);
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log("\nSIGTERM received. Cleaning up...");
        await cleanup(filePath);
        process.exit(0);
    });

    console.log("Press Ctrl+C to exit and trigger cleanup.");
})();

async function cleanup(filePath) {
    try {
        await removeCollection(); // Remove the MongoDB collection
        console.log("Database collection cleaned up.");

        await fs.unlink(filePath); // Delete the file
        console.log(`File '${filePath}' deleted successfully.`);
    } catch (err) {
        console.error("Error during cleanup:", err);
    } finally {
        try {
            await client.close(); // Close the database connection
            console.log("Database connection closed.");
        } catch (closeErr) {
            console.error("Error during database connection closure:", closeErr);
        }
    }
}