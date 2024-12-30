require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send("boss is Sitting");
})
app.listen(port, ()=>{
    console.log("boss is starting on Port", port)
})