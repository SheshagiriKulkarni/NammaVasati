const express = require("express");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
const path = require("path");
const Advertisement = require("../models/Advertisement");

const router = express.Router();

// MongoDB connection and GridFS
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/pgAds";
const conn = mongoose.connection;

// Init gfs
let gfs;
conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// GridFS Storage
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// POST route to create a new advertisement with images
router.post("/", upload.array("images"), async (req, res) => {
  try {
    const {
      pgName,
      price,
      gender,
      amenities,
      occupancy,
      description,
      latitude,
      longitude,
      locationName,
      mailid,
    } = req.body;

    const images = req.files.map((file) => file.filename);

    const newPG = new Advertisement({
      pgName,
      price,
      gender,
      amenities: JSON.parse(amenities),
      occupancy,
      description,
      latitude,
      longitude,
      locationName,
      images,
      mailid,
    });

    await newPG.save();
    res.status(200).json({ message: "Ad posted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving ad" });
  }
});

router.get("/images/:filename", async (req, res) => {
  try {
    // Query the file based on the filename
    const file = await gfs.files.findOne({ filename: req.params.filename });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Create the read stream using the file's unique _id
    const readStream = gridfsBucket.openDownloadStream(file._id);

    // Set the appropriate content type
    res.set("Content-Type", file.contentType);

    // Pipe the read stream to the response
    readStream.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.get("/pgsbyname", async (req, res) => {
  const searchQuery = req.query.search;
  try {
    const pgs = await Advertisement.find({
      pgName: { $regex: searchQuery, $options: "i" },
    });

    res.json(pgs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/pgs", async (req, res) => {
  const searchQuery = req.query.search;
  try {
    const pgs = await Advertisement.find({
      $or: [
        { pgName: { $regex: searchQuery, $options: "i" } },
        { locationName: { $regex: searchQuery, $options: "i" } },
      ],
    });

    res.json(pgs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/wishlist", async (req, res) => {
  try {
    const { wishlist } = req.body; // Array of wishlisted ad IDs

    if (!wishlist || wishlist.length === 0) {
      return res.json([]); // Return empty if wishlist is empty
    }

    const wishlistedAds = await Advertisement.find({ _id: { $in: wishlist } });
    console.log(wishlistedAds);
    res.json(wishlistedAds);
  } catch (error) {
    console.error("Error fetching wishlisted ads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/myads", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const ads = await Advertisement.find({ mailid: email });

    res.status(200).json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:adId", async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await Advertisement.findById(adId);

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.json(ad);
  } catch (error) {
    console.error("Error fetching ad details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET route to fetch all advertisements
router.get("/", async (req, res) => {
  try {
    const ads = await Advertisement.find();
    res.status(200).json(ads);
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
