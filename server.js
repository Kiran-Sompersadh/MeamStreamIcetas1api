// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { GridFSBucket } = require('mongodb');
const path = require('path');
const Meme = require('./models/Meme'); // your Meme model
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection failed:', err.message));

// GridFS storage setup
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => ({
    filename: `${Date.now()}-${file.originalname}`,
    bucketName: 'memes'
  })
});
const upload = multer({ storage });

// GridFSBucket (for serving files)
let gfsBucket;
mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'memes' });
  console.log('✅ GridFSBucket ready');
});

// Health check
app.get('/', (req, res) => res.send('🎉 MemeStream API is running with file uploads!'));

// Upload meme image + metadata
app.post('/memes/upload', upload.single('image'), async (req, res) => {
  try {
    const { userId, caption, lat, lng } = req.body;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // URL to access the image
    const imageUrl = `${req.protocol}://${req.get('host')}/memes/file/${req.file.filename}`;

    // Create Meme document
    const meme = new Meme({
      userId,
      caption,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      imageUrl,
      timestamp: new Date()
    });

    const saved = await meme.save();
    res.status(201).json({ meme: saved, url: imageUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Serve uploaded images
app.get('/memes/file/:filename', async (req, res) => {
  try {
    const file = await mongoose.connection.db.collection('memes.files')
      .findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ error: 'File not found' });

    const downloadStream = gfsBucket.openDownloadStreamByName(req.params.filename);
    downloadStream.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Existing /memes routes
app.use('/memes', require('./routes/memes'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
