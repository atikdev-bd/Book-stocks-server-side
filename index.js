const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { query } = require("express");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

///middle ware ///
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.BOOK_DATA}:${process.env.PASSWORD}@cluster0.h7epoo8.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = () => {
  try {
    /// books category collection \\\
    const bookCategoriesCollection = client
      .db("books")
      .collection("books-categories");
    /// All books collection ///
    const booksCollection = client.db("books").collection("booksData");

    /// user collection ///
    const usersCollection = client.db("books").collection("users");

    /// order collection///
    const orderCollection = client.db("books").collection("orders");

    /// buyer and order products info ///
    app.post("/orders", async (req, res) => {
      const info = req.body;
      const result = await orderCollection.insertOne(info);
      res.send(result);
    });

    ///get order data ////
    app.get("/orders", async (req, res) => {
      const query = {};
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    /// get buyer or not ///
    app.get("/user/buyers/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await orderCollection.findOne(query);
      if (user.buyerName) {
        res.send({ isBuyer: true });
      }
    });

    /// post book data ///
    app.post("/books", async (req, res) => {
      const book = req.body;
      const result = await booksCollection.insertOne(book);
      res.send(result);
    });

    /// get all book categories ////
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await bookCategoriesCollection.find(query).toArray();
      res.send(result);
    });
    /// get data with category id///
    // app.get("/category/:id", async (req, res) => {
    //   const id =  req.params.id;
    //   console.log(id)
    //   const singleCategory = await booksCollection.filter(
    //     (data) => data.categoryId === id
    //   ).toArray()

    //   res.send(singleCategory);
    // });

    /// get all books collection ///
    app.get("/category", async (req, res) => {
      const query = {};

      const allBooks = await booksCollection.find(query).toArray();
      res.send(allBooks);
    });

    //// get user info  using post method \\\

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    /// get all user ///
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    /// get books data with name query///
    app.get("/books", async (req, res) => {
      const name = req.query.name;
      const query = {};
      const allBooks = await booksCollection.find(query);
      const nameQuery = { sellerName: name };
      const result = await booksCollection.find(nameQuery).toArray();
      res.send(result);
    });

    /// get all sellers ///

    app.get("/sellers", async (req, res) => {
      const query = { role: "seller account" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    /// get all buyers ///
    app.get("/buyers", async (req, res) => {
      const query = { role: "buyer account" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    /// delete buyer ///
    app.delete("/buyers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    /// delete book ////

    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await booksCollection.deleteOne(query);
      res.send(result);
    });

    //// get one book with id ///
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    /// up

    app.put("/books/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          isAdvertise: true,
        },
      };
      const result = await booksCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    /// get advertise data ///
    app.get("/advertise", async (req, res) => {
      const advertise = { isAdvertise: true };
      const result = await booksCollection.find(advertise).toArray();
      res.send(result);
    });
  } finally {
  }
};

run();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server running on port${port}`);
});
