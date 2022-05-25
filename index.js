const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

// console.log(stripe)

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
        const userCollection = client.db('flying-drone').collection('users')
        const paymentCollection = client.db('flying-drone').collection('payments')
        const reviewCollection = client.db('flying-drone').collection('reviews')

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

        app.post('/tools', async (req, res) => {
            const tool = req.body;
            const result = await toolsCollection.insertOne(tool);
            res.send(result)
        })

        app.delete('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolsCollection.deleteOne(query);
            res.send(result)
        })

        // orders api
        app.get('/orders', async (req, res) => {
            const query = {};
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        })

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

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            // const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send(result);
        })

        app.get('/user', async (req, res) => {
            const query = {};
            const result = await userCollection.find(query).toArray()
            res.send(result)
        })

        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email }
            const updatedDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: { status: "shipped" },
            };
            const result = await orderCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })


        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === "admin";
            res.send({ admin: isAdmin })
        })

        // review api
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        app.get('/review', async (req, res) => {
            const query = {};
            const reviews = await reviewCollection.find(query).toArray()
            res.send(reviews);
        })

        // payment api
        app.post('/create-payment-intent', async (req, res) => {
            const service = req.body;
            const price = service.price;
            const amount = price * 100;
            // console.log(amount)
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });

            res.send({ clientSecret: paymentIntent.client_secret })
        });

        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            // console.log(payment)
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const result = await paymentCollection.insertOne(payment);
            const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
            res.send(updatedOrder);
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