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
let freeCar = {
    id: null,
    currentLocation: [null, null], // Initialize with null indicating no value set yet
    destination: [null, null],     // Initialize with null as placeholder for future values
    inUse: "No"
};

async function query(uservalue) {
  try {
    await client.connect();
    const database = client.db(dbName);
    const cars = database.collection('Autonomous Cars');
    const query = { inUse: uservalue };
    const queryResult = await cars.findOne(query);
    
    if (queryResult) {
      // Assign the query results to the freecar object which will be then returned to backend
      freeCar = {
        id: queryResult._id.toString(),
        currentLocation: queryResult.currentLocation,
        destination: queryResult.Destination ,
        inUse: queryResult.inUse
      };
      return freeCar;
    }
    
  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
  }
}

async function updateCar(destinationX, destinationY) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection('Autonomous Cars');
    
        const filter = { _id: new ObjectId(freeCar.id) };
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


    // update x and y destination values to what ever the user requests
    // change in use to Yes



async function main() {
    let uservalue = prompt("Do you want to request an autonomous car? (Yes/No): "); // will automatically assume backend wants a free car
    let inUse = null;
    if (uservalue.trim() == "Yes") {
        inUse = "No";
    } else {
        inUse = "Yes";
    }
    // dummy value for now
    let freeCar = await query(inUse); // Added trim() to clean up the input
    console.log(freeCar);

    const destinationX = 5; //dummy values for now, will get these values from backend
    const destinationY = 300; //dummy values for now, will get these values from backend
    updateCar(destinationX, destinationY);
    console.log(freeCar);
    return freeCar;   
}

main();
