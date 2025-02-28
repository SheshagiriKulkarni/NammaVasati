const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import User schema

router.get("/", async (req, res) => {
  try {
    const { email } = req.query; // Get email from query params

    if (!email) {
      return res.status(400).json({ message: "User email is required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return only the wishlisted_ads array
    res.json({ wishlisted_ads: user.wishlisted_ads });
  } catch (error) {
    console.error("Error fetching wishlisted ads:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/update-wishlist", async (req, res) => {
  try {
    const { email, wishlisted_ads } = req.body;

    if (!email) {
      return res.status(400).json({ message: "User email is required" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { wishlisted_ads },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ wishlisted_ads: user.wishlisted_ads });
  } catch (error) {
    console.error("Error updating wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
