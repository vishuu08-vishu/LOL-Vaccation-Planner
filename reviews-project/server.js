const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require('csv-writer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// CSV file path
const csvFilePath = path.join(__dirname, "travel-data-new.csv");

// Runtime flag: when false, updates are kept in memory and NOT written to disk.
let writeCsvEnabled = true;

// In-memory buffer of recent CSV-style entries (visible via API when not writing to disk)
const recentCsvEntries = [];

// Initialize all data arrays
let allData = {
  customers: [],
  agents: [],
  destinations: [],
  bookings: [],
  reviews: []
};

// Load existing CSV data on startup
function loadCSVData() {
  if (fs.existsSync(csvFilePath)) {
    console.log("✅ Found existing travel-data.csv");
  } else {
    console.log("📝 Creating new travel-data.csv");
    initializeCSV();
  }
}

// Initialize empty CSV file
function initializeCSV() {
  const header = "TYPE,TIMESTAMP,CUSTOMER_ID,CUSTOMER_NAME,CUSTOMER_EMAIL,CUSTOMER_PHONE,AGENT_ID,AGENT_NAME,AGENT_SPEC,AGENT_PHONE,DEST_ID,DEST_NAME,DEST_COUNTRY,DEST_PRICE,BOOKING_CUST,BOOKING_AGENT,BOOKING_DEST,BOOKING_DATE,BOOKING_DURATION,REVIEW_RATING,REVIEW_COMMENTS\n";
  fs.writeFileSync(csvFilePath, header);
}

// Append data to CSV
function appendToCSV(type, data) {
  console.log('Appending to CSV:', type, data);
  const timestamp = new Date().toISOString();
  const fields = new Array(21).fill('');
  fields[0] = type;
  fields[1] = timestamp;

  if (type === "CUSTOMER") {
    if (data.id !== undefined) fields[2] = data.id;
    if (data.name !== undefined) fields[3] = data.name;
    if (data.email !== undefined) fields[4] = data.email;
    if (data.phone !== undefined) fields[5] = data.phone;
  } else if (type === "AGENT") {
    if (data.id !== undefined) fields[6] = data.id;
    if (data.name !== undefined) fields[7] = data.name;
    if (data.spec !== undefined) fields[8] = data.spec;
    if (data.phone !== undefined) fields[9] = data.phone;
  } else if (type === "DESTINATION") {
    if (data.id !== undefined) fields[10] = data.id;
    if (data.name !== undefined) fields[11] = data.name;
    if (data.country !== undefined) fields[12] = data.country;
    if (data.price !== undefined) fields[13] = data.price;
  } else if (type === "BOOKING") {
    if (data.cid !== undefined) fields[14] = data.cid;
    if (data.aid !== undefined) fields[15] = data.aid;
    if (data.did !== undefined) fields[16] = data.did;
    if (data.date !== undefined) fields[17] = data.date;
    if (data.duration !== undefined) fields[18] = data.duration;
  } else if (type === "REVIEW") {
    if (data.rating !== undefined) fields[19] = data.rating;
    if (data.comments !== undefined) fields[20] = data.comments;
  }

  const csvLine = fields.map(f => typeof f === 'string' && f.includes(',') ? `"${f}"` : f).join(',') + '\n';

  // Always keep an in-memory record so the running server reflects updates
  recentCsvEntries.push({ type, timestamp, data, csvLine });

  // Only write to disk if enabled
  if (writeCsvEnabled) {
    try {
      fs.appendFileSync(csvFilePath, csvLine);
      console.log(`✏️ CSV Updated on disk - ${type} added at ${timestamp}`);
    } catch (err) {
      console.log(`Error writing to CSV: ${err.message}`);
    }
  } else {
    console.log(`✏️ CSV Recorded in memory (disk writes disabled) - ${type} at ${timestamp}`);
  }
}

console.log("Starting server...");

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
  loadCSVData();
});

let mongoConnected = false;
const localReviews = [];

// MongoDB connection (optional)
const mongoUri = process.env.MONGODB_URI;

// Schema
const reviewSchema = new mongoose.Schema({
  customer_id: Number,
  agent_id: Number,
  destination_id: Number,
  rating: Number,
  comments: String
});

const Review = mongoose.model("Review", reviewSchema);

if (mongoUri) {
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      mongoConnected = true;
      console.log("MongoDB connected");
    })
    .catch(err => {
      console.error("MongoDB connection error:", err);
      console.log("Continuing with in-memory review storage.");
    });
} else {
  console.log("No MongoDB URI provided. Using in-memory review storage.");
}

// API Endpoints to save data to CSV

// Save Customer
app.post("/api/customers", (req, res) => {
  try {
    console.log('Received customer data:', req.body);
    appendToCSV("CUSTOMER", req.body);
    res.json({ success: true, message: "Customer saved to CSV" });
  } catch (err) {
    console.log('Error in customers:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save Agent
app.post("/api/agents", (req, res) => {
  try {
    appendToCSV("AGENT", req.body);
    res.json({ success: true, message: "Agent saved to CSV" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Destination
app.post("/api/destinations", (req, res) => {
  try {
    appendToCSV("DESTINATION", req.body);
    res.json({ success: true, message: "Destination saved to CSV" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Booking
app.post("/api/bookings", (req, res) => {
  try {
    appendToCSV("BOOKING", req.body);
    res.json({ success: true, message: "Booking saved to CSV" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add review (existing endpoint - also saves to CSV)
app.post("/reviews", async (req, res) => {
  try {
    const reviewData = req.body;
    appendToCSV("REVIEW", reviewData);

    if (mongoConnected) {
      const review = new Review(reviewData);
      await review.save();
    } else {
      localReviews.push(reviewData);
    }

    res.send("Review added");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get reviews
app.get("/reviews", async (req, res) => {
  try {
    if (mongoConnected) {
      const reviews = await Review.find();
      res.json(reviews);
    } else {
      res.json(localReviews);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Return recent in-memory CSV entries (useful when disk writes are disabled)
app.get('/api/recent-csv', (req, res) => {
  res.json({ writeCsvEnabled, entries: recentCsvEntries });
});

// Toggle CSV disk writes at runtime (body: { write: true|false })
app.post('/api/csv-mode', (req, res) => {
  const body = req.body;
  if (typeof body.write !== 'boolean') return res.status(400).json({ error: 'provide { write: true|false }' });
  writeCsvEnabled = body.write;
  res.json({ writeCsvEnabled });
});
