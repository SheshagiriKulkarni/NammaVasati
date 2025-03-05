const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config(); // Load environment variables

const advertisementRoutes = require("./routes/advertisementRoutes");
const authRoutes = require("./routes/authRoutes");
const wishRoutes = require("./routes/wishlist");
const allAdsDetailsRoute = require("./routes/allAdsDetailsRoute");
const chatRoutes = require("./routes/chat");
const Chat = require("./models/Chat"); // Import Chat model

const app = express();
const PORT = 5000; // Unified port for Express & WebSockets

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Routes
app.use("/auth", authRoutes);
app.use("/api/advertise", advertisementRoutes);
app.use("/api/wishlist", wishRoutes);
app.use("/api/ads", allAdsDetailsRoute);
app.use("/api/chat", chatRoutes);

// WebSocket Setup
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // socket.on("sendMessage", async (data) => {
  //   try {
  //     const { roomId, senderEmail, receiverEmail, message } = data;
  //     const newMessage = new Chat({ roomId, senderEmail, receiverEmail, message });
  //     await newMessage.save();

  //     io.to(roomId).emit("receiveMessage", newMessage); // Emit new message to all users in room
  //   } catch (error) {
  //     console.error("Error saving message:", error);
  //   }
  // });
  socket.on("sendMessage", async (data) => {
    try {
      const { roomId, senderEmail, receiverEmail, message } = data;
  
      // Check if message already exists to prevent duplicates
      const existingMessage = await Chat.findOne({
        roomId,
        senderEmail,
        receiverEmail,
        message,
      });
  
      if (existingMessage) return; // Stop duplicate storage
  
      // Save new message
      const newMessage = new Chat({ roomId, senderEmail, receiverEmail, message });
      await newMessage.save();
  
      // Emit only to users in the same room
      io.to(roomId).emit("receiveMessage", newMessage);
  
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });
  
  
  
  
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server (Single entry point for HTTP & WebSocket)
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
