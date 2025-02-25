const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema({
  pgName: String,
  price: String,
  gender: String,
  amenities: [String],
  occupancy: String,
  description: String,
  latitude: Number,
  longitude: Number,
  locationName: String,
  images: [String],
  mailid: String,
});

module.exports = mongoose.model("Advertisement", advertisementSchema);
