const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.zz02t.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();

        const reviewsCollection = client.db('manufacturer-website').collection('reviews');
        const productsCollection = client.db('manufacturer-website').collection('products');
        const ordersCollection = client.db('manufacturer-website').collection('orders');
        const usersCollection = client.db('manufacturer-website').collection('users');

        // get
        app.get('/reviews', async(req, res) => {
            const query = {};
            const result = await reviewsCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/products', async(req,res) => {
            const query = {};
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/product/:id', async(req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productsCollection.findOne(query);
            res.send(result)
        })

        // post
        app.post('/review', async(req, res) => {
            const data = req.body;
            const doc = data;
            const result = await reviewsCollection.insertOne(doc);
            res.send(result)
        })
        app.post('/order', async(req, res) => {
            const data = req.body;
            const doc = data;
            const result = await ordersCollection.insertOne(doc);
            res.send(result)
        })

        // put
        app.put('/user/:email', async(req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            })
            res.send({result, token});
        })

        console.log('Database connected')
    }
    finally{

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello. manufacturer-website is working fine')
})

app.listen(port, () => {
    console.log('manufacturer-website app is listening on port', port)
})