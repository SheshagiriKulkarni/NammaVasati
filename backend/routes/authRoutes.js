const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import the User model
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
const path = require("path");

const router = express.Router();
const SECRET_KEY = "your_secret_key"; // Use a strong key and keep it safe

const resetTokens = new Map();

// Register Endpoint
// Signup Endpoint

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/pgAds";
const conn = mongoose.connection;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your preferred email service
  auth: {
    user: "kulkarnishashank962@gmail.com", // your email
    pass: "lhrurqqhljtumyqb", // your email password or app-specific password
  },
});

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

router.post("/uploadProfileImage", upload.single("image"), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "User email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's image field with the uploaded image filename
    user.image = req.file.filename;
    await user.save();

    res.status(200).json({
      message: "Profile image uploaded successfully!",
      filename: req.file.filename,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading profile image" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    console.log("Received password update request:", req.body);
    // Validate input
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required." });
    }

    // Find user in DB
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword.toString(), 10);

    console.log("Hashed password:", hashedPassword);

    // Update password in DB
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Password update error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/send-reset-email", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // If no user found with this email
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account associated with this email address exists.",
      });
    }
    // Generate a unique reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store the token with the email (with expiration)
    resetTokens.set(resetToken, {
      email,
      expires: Date.now() + 3600000, // 1 hour expiration
    });

    // Create your custom reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${encodeURIComponent(
      email
    )}`;

    // Email template
    const mailOptions = {
      from: "kulkarnishashank962@gmail.com", // your sender email
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({ success: true });
  } catch (error) {
    console.error("Error sending reset email:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/updateMobileNumber", async (req, res) => {
  const { email, mobileNumber } = req.body;

  try {
    // Validate mobile number (optional but recommended)
    const mobileNumberRegex = /^[6-9]\d{9}$/;
    if (!mobileNumberRegex.test(mobileNumber)) {
      return res.status(400).json({ message: "Invalid mobile number format" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update mobile number
    user.number = mobileNumber;
    await user.save();

    res.status(200).json({
      message: "Mobile number updated successfully",
      mobileNumber: user.number,
    });
  } catch (error) {
    console.error("Error updating mobile number:", error);
    res
      .status(500)
      .json({ message: "Server error while updating mobile number" });
  }
});

router.get("/getMobileNumber/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return mobile number (or null if not set)
    res.status(200).json({
      mobileNumber: user.number || null,
    });
  } catch (error) {
    console.error("Error fetching mobile number:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching mobile number" });
  }
});

router.get("/profileImage/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("Requested email:", email); // Add logging

    // Find user by email
    const user = await User.findOne({ email });

    // Additional logging
    console.log("User found:", user);

    if (!user) {
      console.log("No user found with this email");
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.image) {
      console.log("No image associated with user");
      return res.status(404).json({ message: "No profile image uploaded" });
    }

    console.log("Looking for image filename:", user.image);

    // Retrieve the image from GridFS
    const file = await gfs.files.findOne({ filename: user.image });

    console.log("File found in GridFS:", file);

    if (!file) {
      return res
        .status(404)
        .json({ message: "Image file not found in GridFS" });
    }

    const readStream = gridfsBucket.openDownloadStream(file._id);
    res.set("Content-Type", file.contentType);
    readStream.pipe(res);
  } catch (error) {
    console.error("Detailed error fetching profile image:", error);
    res.status(500).json({
      message: "Internal server error",
      errorDetails: error.message,
    });
  }
});

router.post("/signup", async (req, res) => {
  const { SupEmail, mobileNumber, SupPassword } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ SupEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(SupPassword, 10);

    // Save the user to the database with joinedDate
    const newUser = new User({
      email: SupEmail,
      number: mobileNumber,
      password: hashedPassword,
      joinedDate: new Date(), // ✅ Explicitly setting joinedDate
    });

    await newUser.save();

    // Respond with success message
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
