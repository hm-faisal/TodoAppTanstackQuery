require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["https://tanstack-to-do-app.vercel.app", "http://localhost:5173"],
    methods: "GET,POST,PUT,DELETE",
  })
);

const PORT = process.env.PORT || 5000;

app.get("/", (_, res) => {
  res.json({ message: "Welcome to todo app" });
});

const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.zgbnt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("ToDoApp");
    const users = database.collection("users");
    const todos = database.collection("todos");
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    app.post("/createUser", async (req, res, next) => {
      const { email, name } = req.body;

      // Validate request body
      if (!email || !userId || !name) {
        throw error("Invalid Info", 404);
      }

      // Check if the user already exists
      const user = await users.findOne({ email });
      if (user) {
        throw error("User already exists", 400);
      }

      // Create the new user
      const newUser = await users.insertOne({ userId, email, name });

      res
        .status(201)
        .json({ message: "User created successfully", ...newUser });
    });

    // Task
    app.get("/task/:email", async (req, res, next) => {
      const { email } = req.params;

      try {
        const tasks = await todos.find({ userEmail: email }).toArray();

        const todo = tasks.filter((item) => item.category === "todo");
        const inprogress = tasks.filter(
          (item) => item.category === "inProgress"
        );
        const complete = tasks.filter((item) => item.category === "completed");

        res.status(200).json({
          todo: todo,
          inProgress: inprogress,
          completed: complete,
        });
      } catch (err) {
        next(err);
      }
    });
    app.put("/task/:id", async (req, res, next) => {
      try {
        const { id } = req.params;
        const { destCol: category } = req.body;

        const updateResult = await todos.updateOne(
          { _id: new ObjectId(id) },
          { $set: { category: category } },
          { upsert: false }
        );

        if (updateResult?.matchedCount === 0) {
          throw error("Task not found", 404);
        }

        res.status(200).json({ message: "Task updated successfully" });
      } catch (err) {
        next(err);
      }
    });
    app.delete("/task/:id", async (req, res, next) => {
      try {
        const { id } = req.params;
        const deleteResult = await todos.deleteOne({ _id: new ObjectId(id) });

        if (deleteResult?.deletedCount === 0) {
          throw error("Task not found", 404);
        }

        res.status(204).send();
      } catch (err) {
        next(err);
      }
    });
    app.post("/task", async (req, res, next) => {
      try {
        const { title, description, category, email } = req.body;
        if (!title || !description || !category) {
          throw error("Invalid input data", 400);
        }

        const createdTask = await todos.insertOne({
          title,
          description,
          category,
          userEmail: email,
        });
        res.status(201).json({ message: "Task created", ...createdTask });
      } catch (err) {
        next(err);
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.use((err, req, res, next) => {
  console.log(err);
  const message = err.message ? err.message : "Server Error Occurred";
  const status = err.status ? err.status : 500;
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log("app running");
});
