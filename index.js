const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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
    const bookCategoriesCollection = client
      .db("books")
      .collection("books-categories");

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await bookCategoriesCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
};

run()

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server running on port${port}`);
});
