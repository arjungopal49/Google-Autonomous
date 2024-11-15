import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb';
import polylineCodec from '@googlemaps/polyline-codec';
const { decode } = polylineCodec;


const username = encodeURIComponent("eksmith26");
const password = encodeURIComponent("Grace27$$");  // URL encoded password
const dbName = "Simu8";
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

// return an array of all free cars to backend
export async function query() {
    try {
        await client.connect();  // Ensure connection is established
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
        const query = {status: "free"};

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
export async function updateCar(carId, destinationX, destinationY, status) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
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

// function to free up car after the ride is completed. takes in carId and change the status to free
export async function freeUpCar(carId) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
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
    } finally {
        await client.close();
    }
}


// stores the coordinates of the rectangle which has traffic in the database
export async function generateTraffic(minLatLng, maxLatLng){
    try{
        await client.connect();
        const database = client.db(dbName);
        const traffic = database.collection('Traffic');
        // Calculate the other two corners of the rectangle
        const topLeft = { lat: maxLatLng.lat, lng: minLatLng.lng };
        const bottomRight = { lat: minLatLng.lat, lng: maxLatLng.lng };
        // Create a rectangle object to store in the database
        const rectangleData = {
            bottomLeft: minLatLng,       // Bottom-left corner
            bottomRight: bottomRight,  // Bottom-right corner
            topLeft: topLeft,        // Top-left corner
            topRight: maxLatLng     // Top-right corner
        };
        // Insert the rectangle into the database
        const result = await traffic.insertOne(rectangleData);
        console.log("Traffic generated successfully");
    }
    catch(err){
        console.error("An error occurred:", err);
    }
    finally{
        await client.close();
    }
}

// function to remove traffic from the database
export async function removeTraffic(minLatLng, maxLatLng){
    try{
        await client.connect();
        const database = client.db(dbName);
        const traffic = database.collection('Traffic');
        // Define a query to match traffic entries with the specified coordinates
        const query = {
            minLatLng: minLatLng,
            maxLatLng: maxLatLng
        };
        const result = await traffic.deleteMany(query);
        console.log("Traffic removed successfully");
    }
    catch(err){
        console.error("An error occurred:", err);
    }
    finally{
        await client.close();
    }
}