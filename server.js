require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Allow server to accept JSON data

// --- In-Memory Database (for demonstration) ---
let db = {
  workouts: [],
  waterCount: 0,
  preferences: {
    distanceUnit: 'km',
    timeUnit: 'min',
  },
};

// --- API Endpoints ---

// GET all application data
app.get('/api/data', (req, res) => {
  console.log('GET /api/data: Sending all data to frontend.');
  res.status(200).json(db);
});

// POST a new workout
app.post('/api/workouts', (req, res) => {
  const { exercise, duration } = req.body;
  
  if (!exercise || !duration) {
    return res.status(400).json({ message: 'Exercise and duration are required.' });
  }

  const newWorkout = {
    date: new Date().toDateString(),
    exercise,
    duration,
    calories: duration * 5, // Same logic as your frontend
  };
  
  db.workouts.push(newWorkout);
  console.log('POST /api/workouts: Added workout:', newWorkout);
  res.status(201).json(newWorkout); // Send back the created workout
});

// POST to update user data (water and preferences)
app.post('/api/profile', (req, res) => {
  const { waterCount, preferences } = req.body;

  if (waterCount !== undefined) {
    db.waterCount = waterCount;
    console.log('POST /api/profile: Updated water count to', db.waterCount);
  }

  if (preferences) {
    db.preferences = { ...db.preferences, ...preferences };
    console.log('POST /api/profile: Updated preferences to', db.preferences);
  }

  res.status(200).json({ message: 'Profile updated successfully!', profile: { waterCount: db.waterCount, preferences: db.preferences }});
});


app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
