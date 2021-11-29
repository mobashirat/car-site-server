const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())

const uri = 'mongodb+srv://carsiteDB:2JQEpadpuWdfOjLZ@cluster0.179te.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('carshop');
        const productCollection = database.collection('products')
        const bookingCollection = database.collection('bookings')
        const usersCollection = database.collection('users')
        const reviewsCollection = database.collection('reviews')

        //get bookings 120
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = bookingCollection.find(query);
            const bookings = await cursor.toArray();
            res.json(bookings);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)
            console.log(result),
                res.json(result)

        })

        //get api
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({})
            const products = await cursor.toArray();
            res.send(products)


        })
        //post reviews
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            res.json(result)
        });
        // get reviews
        app.get('/allreviews', async (req, res) => {
            const result = await reviewsCollection.find({}).toArray();
            res.json(result)

        });

        //admin create admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        //user collection
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)

            res.json(result)

        })

        //get singleproduct

        app.get('/singleProduct/:id', async (req, res) => {
            const result = await productCollection.find({ _id: ObjectId(req.params.id) }).toArray();
            res.send(result[0])
        })

        //add product
        app.post('/addProduct', async (req, res) => {
            const result = await productCollection.insertOne(req.body);
            res.send(result);
        })

        //delete from my  orders

        app.delete("/deleteOrder/:id", async (req, res) => {
            const result = await bookingCollection.deleteOne({
                _id: ObjectId(req.params.id),

            })
            res.send(result);
        })
        //delete from products
        app.delete("/products/:id", async (req, res) => {
            const result = await productCollection.deleteOne({
                _id: ObjectId(req.params.id),

            })
            res.send(result);
        })

        //make admin
        app.put('/users/admin', async (req, res) => {

            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

    }


    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello car!')
})

app.listen(port, () => {
    console.log(` listening at ${port}`)
})