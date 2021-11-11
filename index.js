const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const ObjectId = require("mongodb").ObjectId;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3fgg4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connected to database');
        const database = client.db('Autozon');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('review');


        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        //ADD Order by POST Method
        app.post('/orders', async (req, res) => {
            const orderProduct = req.body;
            console.log(orderProduct);
            const result = await ordersCollection.insertOne(orderProduct);
            res.send(result);
        });

        // database user POST
        app.post('/users', async (req, res) => {
            user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // google signin data save or update by PUT
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // make admin role PUT API (verifyToken, async er ager part 101 line)
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log('decodedEmail', req.decodedEmail);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result);

        });

        // admin data get by GET 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // GET my Orders
        app.get('/myOrders/:email', async (req, res) => {
            const result = await ordersCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        // DELETE an Personal Ordered Event
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(id);
            const result = await ordersCollection.deleteOne(query);
            console.log("Deleting user with id ", result);
            res.send(result);
        });

        //  Get API for Manage All Order
        app.get('/manageAllOrder', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
            console.log(result);
        });

        // Add product API Post Api
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

        //DELETE Product
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        //Add Review API
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });
        //Get API for All Review 
        app.get('/addReview', async (req, res) => {
            const result = await reviewsCollection.find({}).toArray();
            res.send(result);
            console.log(result);
        });


    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Autozon server running');
});


app.listen(port, () => {
    console.log('Running autozon server on port', port);
})