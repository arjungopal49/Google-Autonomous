
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb+srv://eksmith26:Grace27$$@autosimulate.7qsly.mongodb.net/?retryWrites=true&w=majority&appName=AutoSimulate";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const database = client.db('Simu8');
    const cars = database.collection('Autonomous Cars');
    const query = { Status: 'Moving'};
    const movingCars = await cars.findOne(query);
    
    console.log(movingCars);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);