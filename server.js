const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./database");
const Profile = require("./models/profile");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Add new profile
app.post("/api/profiles", async (req, res) => {
  try {
    const profile = await Profile.create(req.body);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch all profiles
app.get("/api/profiles", async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await db.sync({ alter: true });
});
