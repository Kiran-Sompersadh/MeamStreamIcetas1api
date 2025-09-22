// Import the Express framework
const express = require('express');

// Create a new router instance
const router = express.Router();

// Import the Meme model we defined in Meme.js
const Meme = require('../models/Meme');


// GET /memes
// This endpoint fetches all memes from the database.
// If a `userId` is provided in the query string, it filters by that user.
router.get('/', async (req, res) => {
  try {
    const memes = req.query.userId
      ? await Meme.find({ userId: req.query.userId }) // Get memes by user
      : await Meme.find();                            // Get all memes

    // Return the memes as JSON
    res.json(memes);
  } catch (err) {
    // Return error response if something goes wrong
    res.status(500).json({ error: err.message });
  }
});


// POST /memes
// This endpoint allows a client (like your Android app) to upload a new meme.
// It expects a JSON body with userId, imageUrl, caption, lat, lng, timestamp.
router.post('/', async (req, res) => {
  try {
    // Create a new Meme document using the request body
    const meme = new Meme(req.body);

    // Save the meme to the database
    const saved = await meme.save();

    // Return the newly created meme with status 201 (Created)
    res.status(201).json(saved);
  } catch (err) {
    // Return validation or input errors
    res.status(400).json({ error: err.message });
  }
});


// Export this router so it can be used in server.js
module.exports = router;