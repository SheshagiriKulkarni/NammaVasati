const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  roomId: String,
  senderEmail: String,
  receiverEmail: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", chatSchema);
