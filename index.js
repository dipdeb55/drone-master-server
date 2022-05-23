const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

// dronedb
// oolpEkM7WccR6jLG




// const uri = "mongodb+srv://dronedb:oolpEkM7WccR6jLG@cluster0.upnsi.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.upnsi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.use(cors())
app.use(express.json())

async function run() {

    try {

        await client.connect()
        const toolsCollection = client.db('flying-drone').collection('tools')
        const orderCollection = client.db('flying-drone').collection('orders')

        app.get('/tools', async (req, res) => {
            const query = {}
            const tools = await toolsCollection.find(query).toArray();
            res.send(tools);

        })

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await toolsCollection.findOne(query)
            res.send(result)
        })

        // orders api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })

        app.get('/orders/myorder', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await orderCollection.find(query).toArray()
            res.send(result);
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.findOne(query)
            res.send(result)

        })

    }
    finally {

    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Drone is flying')
})

app.listen(port, () => {
    console.log(`Example app listening on port `, port)
})