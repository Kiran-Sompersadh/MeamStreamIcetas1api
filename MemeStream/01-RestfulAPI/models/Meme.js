// Import the mongoose library, which helps interact with MongoDB
const mongoose = require('mongoose');

// Define the structure (schema) for a Meme document in the MongoDB collection
const MemeSchema = new mongoose.Schema({
  // The unique ID of the user who created the meme
  userId: { type: String, required: true },

  // The URL of the meme image (from GIPHY or uploaded)
  imageUrl: { type: String, required: true },

  // Optional caption text added to the meme
  caption: { type: String },

  // Latitude where the meme was created (for geotagging)
  lat: { type: Number },

  // Longitude where the meme was created (for geotagging)
  lng: { type: Number },

  // Timestamp of when the meme was created; defaults to current time
  timestamp: { type: Date, default: Date.now }
});

// Export the Meme model so it can be used in other parts of the project
// This will create a "memes" collection in MongoDB
module.exports = mongoose.model('Meme', MemeSchema);