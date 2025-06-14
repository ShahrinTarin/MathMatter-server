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

    const blogsCollection = client.db('mathMatter').collection('blogs')
    const wishlistCollection = client.db('mathMatter').collection('wishlist')
    const commentsCollection = client.db('mathMatter').collection('comments')

    app.get('/blogs', async (req, res) => {
      const { category, title } = req.query;

      let query = {}
      if (category) {
        query.category = { $regex: category, $options: "i" };
      }

      if (title) {
        query.title = { $regex: title, $options: "i" };
      }

      const cursor = blogsCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/recentblogs', async (req, res) => {
      const cursor = blogsCollection.find().sort({ createdAt: -1 }).limit(6)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/topblogs', async (req, res) => {
      const cursor = blogsCollection.find().sort({ longDescriptionLength: -1 }).limit(10)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogsCollection.findOne(query);
      res.send(result);
    })


    app.get('/wishlist/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { userEmail: email }
      const result = await wishlistCollection.find(filter).toArray();
      for (const wish of result) {
        const wishlistId = wish.blogId
        const wishlistdata = await blogsCollection.findOne({
          _id: new ObjectId(wishlistId),
        })
        wish.title = wishlistdata.title
        wish.image = wishlistdata.image
        wish.short_description = wishlistdata.short_description
        wish.long_description = wishlistdata.long_description
      }
      res.send(result);
    })


    app.get('/comment/:blogId', async (req, res) => {
       const blogId = req.params.blogId;
      const result = await commentsCollection.find({ blogId: blogId }).toArray();
      res.send(result);
    })

    app.post('/blogs', async (req, res) => {
      const newBlog = req.body
      const longDescriptionLength = newBlog.longDescriptionLength
      newBlog.longDescriptionLength = parseInt(longDescriptionLength)
      const result = await blogsCollection.insertOne(newBlog)
      res.send(result)
    })

    app.post('/wishlist/:blogId', async (req, res) => {
      const wishlistBlogs = req.body
      const result = await wishlistCollection.insertOne(wishlistBlogs)
      res.send(result)
    })

    app.post('/comment/:blogId', async (req, res) => {
      const comment = req.body
      const result = await commentsCollection.insertOne(comment)
      res.send(result)
    })

    app.put('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const blog = req.body;
      const updateDoc = {
        $set: blog,
      };
      const result = await blogsCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.delete('/wishlist/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await wishlistCollection.deleteOne(query)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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