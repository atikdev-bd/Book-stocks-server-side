const express = require("express");
const {
  MongoClient,
  ServerApiVersion,
  Transaction,
  ObjectId,
} = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

///middle ware ///
app.use(cors());
app.use(express.json());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const uri = `mongodb+srv://${process.env.BOOK_DATA}:${process.env.PASSWORD}@cluster0.h7epoo8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
    if (error) {
      return res.status(403).send({ massage: "forbidden access" });
    }

    req.decoded = decoded;
    next();
  });
};

const run = () => {
  try {
    /// books category collection \\\
    const bookCategoriesCollection = client
      .db("books")
      .collection("books-categories");
    /// All books collection ///
    const booksCollection = client.db("books").collection("booksData");

    const paymentCollection = client.db("books").collection("paymentData");

    const paidUserCollection = client.db("books").collection("paidUser");

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
      const email = req.query.email;

      const query = { email: email };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    ///payment intent///

    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;

      const amount = price * 100;

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    /// store payment data ///

    app.post("/payment", async (req, res) => {
      const info = req.body;
      const result = await paymentCollection.insertOne(info);
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

    ///PAYMENT METHOD STRIPE ///

    /// create payment user in database///

    /// get all book categories ////
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await bookCategoriesCollection.find(query).toArray();

      res.send(result);
    });

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

    ///verify seller///

    app.get("/verify/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          verified: true,
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc, option);
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

    /// upsert some word in order data ///

    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          sold: true,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

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

    //// change book sold ////

    app.get("/booksName", async (req, res) => {
      const name = req.query.name;
      const filter = { name: name };

      const options = { upsert: true };
      const updateDoc = {
        $set: {
          sold: true,
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

    ///delete seller user ///
    app.delete("/seller/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    /// jwt Token ///
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.find(query);

      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN);
        return res.send({ AccessToken: token });
      }
      res.status(403).send({ AccessToken: "" });
    });
  } finally {
  }
};

run();

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server running on port${port}`);
});
