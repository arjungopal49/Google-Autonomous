import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const prompt = (await import('prompt-sync')).default({ sigint: true });
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
    await client.connect();
    const database = client.db(dbName);
    const cars = database.collection('Autonomous Cars');
    const query = { inUse:"No" };
    return await cars.findAll(query);
  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
  }
}

// function to update car location picked by backend for the ride
export async function updateCar(carId, destinationX, destinationY) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
    
        const filter = { _id: new ObjectId(carId) };
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


// async function main() {
//     let uservalue = prompt("Do you want to request an autonomous car? (Yes/No): "); // will automatically assume backend wants a free car
//     let inUse = null;
//     if (uservalue.trim() == "Yes") {
//         inUse = "No";
//     } else {
//         inUse = "Yes";
//     }
//     // dummy value for now
//     let car = await query(inUse); // Added trim() to clean up the input
//
//     const destinationX = 5280; //dummy values for now, will get these values from backend
//     const destinationY = 90; //dummy values for now, will get these values from backend
//     updateCar(destinationX, destinationY);
//
//     console.log(car);
//     return car;
// }
//
// main();
