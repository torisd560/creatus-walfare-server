const express = require('express');
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000

//using middleware
app.use(cors());
app.use(express.json());

//MongoDB URI added
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.os44i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

console.log(uri);

async function run() {
    try {
        await client.connect();

        const database = client.db("creatus_welfare");

        const fundsCollection = database.collection("funds");

        const donationCollection = database.collection("collectedDonation");

        const reviewsCollection = database.collection("reviews");

        const usersCollection = database.collection("users");

        console.log('database connected successfully');

        // Get collected funds data from database
        app.get("/funds", async (req, res) => {
            const cursor = fundsCollection.find({});
            const result = await cursor.toArray();

            res.send(result);
        });

        // Manage  donation ,  Delete Specific funds data from Manage funds
        app.delete("/funds/:fundsId", async (req, res) => {
            console.log("hitted");
            const query = {
                _id: ObjectId(req.params.serviceId),
            };
            console.log(req.params.serviceId);
            const funds = await fundsCollection.deleteOne(query);

            res.json(funds);
        });

        // Inserting donationCollection in the database
        app.post("/collectedDonation", async (req, res) => {
            const donationCollectionData = req.body;

            const userResult = await donationCollection.insertOne(
                donationCollectionData
            );
            res.json(userResult);
        });

        // Getting all the donation of the specific user from the database via email in My Donation
        app.get("/myDonation/:email", async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: `${email}` };
            const result = await donationCollection.find(query).toArray();
            res.send(result);
            console.log(result);
        });
        // Delete specific donation from MyDonation
        app.delete("/deleteDonation/:donationId", async (req, res) => {
            const query = {
                _id: ObjectId(req.params.donationId),
            };

            const result = await donationCollection.deleteOne(query);

            res.json(result);
            console.log(result);
        });

        //Post a review into the database
        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);

            res.json(result);
        });

        //Get all the reviews from the database

        app.get("/reviews", async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();

            res.send(result);
        });

        // --------------Admin-Part--------------------

        //getting all the admins from the database

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //Post a user to the database from email and password sign in

        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        //post a user to the databas efrom the google login by google auth provider

        app.put("/users", async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            console.log(result);
            res.json(result);
        });

        //making an admin

        app.put("/users/admin", async (req, res) => {
            const user = req.body;
            console.log("put", user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // -------------------Manage-All-Donation----------------------

        // Manage All Orders

        app.get("/manageAllDonation", async (req, res) => {
            const cursor = donationCollection.find({});
            const result = await cursor.toArray();

            res.send(result);
        });

        // Manage All Orders by Delete order

        app.delete("/deleteDonation/:donationId", async (req, res) => {
            const query = {
                _id: ObjectId(req.params.donationId),
            };

            const result = await donationCollection.deleteOne(query);

            res.json(result);
        });

        // -----------Donation-Status-Confirmation-----------------

        // Update status Pending to Confirmed
        app.put("/updateStatus/:statusId", async (req, res) => {
            const query = {
                _id: ObjectId(req.params.statusId),
            };
            const filter = query;
            // const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: `Confirmed`,
                },
            };
            const result = await donationCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // Add  product / more Cars to  the Explore page

        app.post("/addFunds", async (req, res) => {
            const addFund = req.body;
            const fundsResult = await fundsCollection.insertOne(addFund);

            res.json(fundsResult);
        });

    }
    finally {
        //await.client.close();
    }
}

//  Last Step
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to Creatus Welfare server')
})

app.listen(port, () => {
    console.log('Running Creatus Welfare server on port', port)
})