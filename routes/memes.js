const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');

// Helper function to format meme objects consistently
function formatMeme(memeDoc) {
  return {
    id: memeDoc._id,
    caption: memeDoc.caption,
    imageUrl: memeDoc.imageUrl,
    userId: memeDoc.userId,
    lat: memeDoc.lat,
    lng: memeDoc.lng,
    timestamp: memeDoc.timestamp
  };
}

// GET /memes
// Fetch all memes, or filter by userId if provided
router.get('/', async (req, res) => {
  try {
    const query = req.query.userId ? { userId: req.query.userId } : {};
    const memes = await Meme.find(query).sort({ timestamp: -1 }); // newest first

    // ✅ Format all memes to match what upload route sends
    res.json(memes.map(formatMeme));
  } catch (err) {
    console.error("❌ Failed to fetch memes:", err);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

// POST /memes
// Create a meme manually (useful if you want to send JSON-only data)
router.post('/', async (req, res) => {
  try {
    const meme = new Meme(req.body);
    const saved = await meme.save();

    // ✅ Return flat JSON
    res.status(201).json(formatMeme(saved));
  } catch (err) {
    console.error("❌ Failed to save meme:", err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

module.exports = router;
