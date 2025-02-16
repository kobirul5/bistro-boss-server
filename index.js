require('dotenv').config()
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgvjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const userCollection= client.db("bristoDB").collection("users");
    const menuCollection= client.db("bristoDB").collection("menu");
    const reviewCollection= client.db("bristoDB").collection("reviews");
    const cartsCollection= client.db("bristoDB").collection("carts");
    // jwt related api 
    app.post('/jwt', async (req, res)=>{
      const user= req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
      res.send({token})
    })

    //middle were 
    const verifyToken = (req,res,next) =>{

      if(!req.headers.authorization){
        return res.status(401).send({message: 'forbidden Access'})
      }
      const token = req.headers.authorization.split(' ')[1]
      console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",token)
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
        if(err){
          return res.status(401).send({message: 'forbidden Access'})
        }
        req.decoded = decoded;
        next()
      })
    }

    // const user 
    app.get("/users", verifyToken, async (req, res)=>{
      
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    app.post('/users', async (req, res)=>{
      const user = req.body;
      const query = {email: user.email}
      const exitingUser = await userCollection.findOne(query);
      if(exitingUser){
         return res.send({message: 'user already exit', insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    app.patch("/users/admin/:id", async (req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set:{
          role: "admin"
        }
      }
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result)
    })

    app.delete("/users/:id", async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })

    app.get("/menu", async (req,res)=>{
        const result = await menuCollection.find().toArray();
        res.send(result)
    })
    app.get("/reviews", async (req,res)=>{
        const result = await reviewCollection.find().toArray();
        res.send(result)
    })

    // carts collection

    app.get("/carts", async (req,res)=>{
      const email = req.query.email;
      const query = {email: email}
      const result = await cartsCollection.find(query).toArray();
      res.send(result)
    })

    app.post("/carts", async (req,res)=>{
      const cartItem = req.body;
      const result = await cartsCollection.insertOne(cartItem);
      res.send(result)
    })

    app.delete("/carts/:id", async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cartsCollection.deleteOne(query);
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




app.get('/', (req, res)=>{
    res.send("boss is Sitting");
})
app.listen(port, ()=>{
    console.log("boss is starting on Port", port)
})