import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb';

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
                "inUse": "No"
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


// Infite loop function that gets the cars in use every second and gets
// the polyline for each car from hashmap or api/backend and class helper function to find the locatiom
//of each car in the next second and update the location in the database
export async function updateCarLocation() {
    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
        const query = {inUse: "Yes"};
        let carsInUse = await cars.find(query).toArray();
        console.log(carsInUse);
        // Loop through each car in use
        for (let car of carsInUse) {
            let carId = car._id;
            const originString = `${car.currentLocation[0]},${car.currentLocation[1]}`;
            const destinationString = `${car.Destination[0]},${car.Destination[1]}`;
            // get the polyline from backend or hashmap
            let polyline = fetchPolylineFromBackend(originString, destinationString);
            console.log(polyline);
            // let nextLocation = getNextLocation(polyline);
            // console.log(nextLocation);

            // const filter = {_id: new ObjectId(carId)};
            // const updateDoc = {
            //     $set: {
            //         "CurrentLocation.0": nextLocation[0],
            //         "CurrentLocation.1": nextLocation[1],
            //     },
            // };
            //
            // const result = await cars.updateOne(filter, updateDoc);
            //
            // if (result.modifiedCount === 1) {
            //     console.log("Successfully updated one document.");
            // } else {
            //     console.log("No documents matched the query. No update was made.");
            // }
        }
    } catch (err) {
        console.error("An error occurred:", err);
        // } finally {
        //     await client.close();
        // }
    }
}

// Helper function to fetch the polyline from the backend
async function fetchPolylineFromBackend(origin, destination) {
    try {
        const response = await fetch(`http://localhost:5000/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
        console.log(response);
        if (!response.ok) {
            console.error("Failed to fetch polyline from backend");
            return null;
        }

        const data = await response.json();
        return data.encodedPolyline;
    } catch (err) {
        console.error("Error fetching polyline:", err);
        return null;
    }
}

// call the updateCarLocation function every second
setInterval(updateCarLocation);
