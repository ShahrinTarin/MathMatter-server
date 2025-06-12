require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4wteejr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const blogsCollection= client.db('mathMatter').collection('blogs')

    

    app.get('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogsCollection.findOne(query);
      res.send(result);
    })

    app.get('/blogs', async (req, res) => {
      const { searchParams } = req.query
      
      let query = {}
      if (searchParams) {
        query = { category: { $regex: searchParams, $options: "i" } }
      }
      const cursor = blogsCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/blogs', async (req, res) => {
      const newBlog = req.body
      const result = await blogsCollection.insertOne(newBlog)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('MathMatter is running')
})


app.listen(port, () => {
  console.log(`MathMatter server is running on ${port}`);
})