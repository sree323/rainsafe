require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "rainsafe";
const allowedOrigin = process.env.FRONTEND_ORIGIN;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !allowedOrigin || origin === allowedOrigin) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "20kb" }));

let reportsCollection;
app.get("/", (_req, res) => res.json({ service: "RainSafe API", status: "running" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", database: reportsCollection ? "connected" : "not connected" }));

app.get("/api/reports", async (_req, res) => {
  try {
    const reports = await reportsCollection.find({})
      .project({ name: 1, location: 1, type: 1, severity: 1, description: 1, createdAt: 1 })
      .sort({ createdAt: -1 }).limit(50).toArray();
    res.json(reports);
  } catch (error) {
    console.error("Read error:", error.message);
    res.status(500).json({ error: "Unable to retrieve reports." });
  }
});

app.post("/api/reports", async (req, res) => {
  const { name = "", location, type, severity, description } = req.body || {};
  const allowedTypes = ["Waterlogging", "Flooded road", "Fallen tree / branch", "Damaged road", "Other rain-related hazard"];
  const allowedSeverity = ["Low", "Medium", "High"];
  if (typeof location !== "string" || !location.trim() || location.length > 120 ||
      !allowedTypes.includes(type) || !allowedSeverity.includes(severity) ||
      typeof description !== "string" || !description.trim() || description.length > 500 ||
      typeof name !== "string" || name.length > 60) {
    return res.status(400).json({ error: "Please provide valid report details." });
  }
  try {
    const report = {
      name: name.trim(), location: location.trim(), type, severity,
      description: description.trim(), createdAt: new Date()
    };
    const result = await reportsCollection.insertOne(report);
    res.status(201).json({ message: "Report saved.", id: result.insertedId });
  } catch (error) {
    console.error("Write error:", error.message);
    res.status(500).json({ error: "Unable to save report." });
  }
});

async function start() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI environment variable is required.");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  reportsCollection = client.db(DB_NAME).collection("reports");
  await reportsCollection.createIndex({ createdAt: -1 });
  app.listen(PORT, () => console.log(`RainSafe API listening on ${PORT}`));
}
start().catch(error => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
