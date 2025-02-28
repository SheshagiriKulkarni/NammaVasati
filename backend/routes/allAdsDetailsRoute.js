const express = require("express");
const router = express.Router();
const Ad = require("../models/Advertisement"); // Import your Ad model

// Fetch all PG ads
router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find();
    console.log(ads);
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
