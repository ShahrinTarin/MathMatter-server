require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
var admin = require("firebase-admin")
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf-8')
var serviceAccount = JSON.parse(decoded)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://mathmatter-by-shahrin-tarin.web.app'],
  credentials: true
}));
app.use(express.json())
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4wteejr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// jwt middlewares
const verifyJWT = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(' ')[1]
  if (!token) return res.status(401).send({ message: 'Unauthorized Access!' })
  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.tokenEmail = decoded.email
    next()
  }
  catch (err) {
    console.log(err)
    return res.status(401).send({ message: 'Unauthorized Access!' })
  }

  // for learning
  // jwt.verify(token,process.env.JWT_SECRET_KEY, (err, decoded) => {
  // if(err){
  //   console.log(err)
  //   return res.status(401).send({ message: 'Unauthorized Access!' })
  // }
  // req.tokenEmail=decoded.email
  // next()
  // })
}

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

    app.get('/wishlist/:email', verifyJWT, async (req, res) => {
      const decodedEmail = req.tokenEmail
      const email = req.params.email
      if (decodedEmail !== email) {
        return res.status(403).send({ message: 'Forbidden Access!' })
      }
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
        wish.category = wishlistdata.category
      }
      res.send(result);
    })


    app.get('/comment/:blogId', async (req, res) => {
      const blogId = req.params.blogId;
      const result = await commentsCollection.find({ blogId: blogId }).toArray();
      res.send(result);
    })

    app.post('/blogs', verifyJWT, async (req, res) => {
      const newBlog = req.body
      const longDescriptionLength = newBlog.longDescriptionLength
      newBlog.longDescriptionLength = parseInt(longDescriptionLength)
      const result = await blogsCollection.insertOne(newBlog)
      res.send(result)
    })

    // for learning
    // generate jwt
    // app.post('/jwt', (req, res) => {
    //   const user = { email: req.body.email }
    //   const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
    //     expiresIn: '7d'
    //   })
    //   res.cookie('token', token, {
    //     httpOnly: true,
    //     secure: false,
    //   }).send({ message: 'jwt created successfully' })
    //   // res.send({ token, message: 'jwt created successfully' })
    // })


    app.post('/wishlist/:blogId', async (req, res) => {
      const { userEmail } = req.body;
      const blogId = req.params.blogId;

      const already = await wishlistCollection.findOne({ blogId, userEmail });
      if (already) {
        return res.status(409).send({ message: 'Blog already in wishlist', alreadyExists: true });
      } else {
        const result = await wishlistCollection.insertOne({ blogId, userEmail });
        return res.status(201).send(result);
      }
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