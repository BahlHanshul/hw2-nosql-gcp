const express = require("express");
const { Datastore } = require("@google-cloud/datastore");

const app = express();
const datastore = new Datastore();

app.use(express.json());

app.get("/greeting", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", async (req, res) => {
  try {
    const username = req.body && req.body.username;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Missing or invalid username" });
    }

    const userKey = datastore.key(["User", username]);
    await datastore.save({
      key: userKey,
      data: { username: username, createdAt: new Date() },
    });

    res.status(200).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/list", async (req, res) => {
  try {
    const query = datastore.createQuery("User");
    const [users] = await datastore.runQuery(query);
    const usernames = users.map((u) => u.username);
    res.status(200).json({ users: usernames });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/clear", async (req, res) => {
  try {
    const query = datastore.createQuery("User");
    const [users] = await datastore.runQuery(query);
    const keys = users.map((u) => u[datastore.KEY]);

    if (keys.length > 0) {
      await datastore.delete(keys);
    }

    res.status(200).json({ message: "Cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(8080, "0.0.0.0", () => {
  console.log("Server running on port 8080");
});
