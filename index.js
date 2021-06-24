const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
require('dotenv').config();
const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.knazp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('database connected')
    const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
    const ordersCollection = client.db(`${process.env.DB_NAME}`).collection("orders");

    //get methods
    app.get('/', (req, res) => {
        res.send('Database is connected!')
    });
    //fetch product details
    app.get('/products', (req, res) => {
        productCollection.find({})
            .toArray((err, products) => {
                res.send(products)
            })
    });
    //fetch product details with id
    app.get('/product/:id', (req, res) => {
        const id = ObjectId(req.params.id)
        productCollection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    });

    app.get('/product/', (req, res) => {
        const queryName = req.query.name;
        console.log(queryName)
        productCollection.find({ name: queryName })
            .toArray((err, documents) => {
                res.send(documents)
            })
    });
    // get orders
    app.get('/orders', (req, res) => {
        const queryEmail = req.query.email
        ordersCollection.find({ userEmail: queryEmail })
            .toArray((err, documents) => {
                res.send(documents)
            })
    });

    //post methods
    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        console.log("newProduct"+newProduct)
        // productCollection.insertOne(newProduct)
        //     .then(result => {
        //         res.send(result.insertedCount > 0)
        //     })

        productCollection.insertOne(newProduct, (err, result) => {
            console.log("result"+result);
            res.send({ count: result.insertedCount });
        })
    });
    // add orders by using post method
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    //patch method for update product
    app.patch('/update/:id', (req, res) => {
        const id = ObjectId(req.params.id)
        productCollection.updateOne({ _id: id },
            {
                $set: { name: req.body.name, price: req.body.price, quantity: req.body.quantity, description: req.body.description, imageURL: req.body.imageURL }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    });

    //delete method
    app.delete('/delete/:id', (req, res) => {
        const id = ObjectId(req.params.id)
        productCollection.deleteOne({ _id: id })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    });
});

app.listen(port);