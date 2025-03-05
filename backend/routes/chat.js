const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");


router.get("/conversations/:userEmail", async (req, res) => {
       console.log("Hi");
        const userEmail = req.params.userEmail;
        console.log("Fetching conversations for:", userEmail); // Debug log
    
        try {
            const messages = await Chat.find({
                $or: [{ senderEmail: userEmail }, { receiverEmail: userEmail }]
            }).sort({ timestamp: -1 });
    
            console.log("Raw Messages:", messages); // Debugging output
    
            let uniqueConversations = new Map();
            messages.forEach((msg) => {
                const otherUser = msg.senderEmail === userEmail ? msg.receiverEmail : msg.senderEmail;
                if (!uniqueConversations.has(otherUser)) {
                    uniqueConversations.set(otherUser, msg);
                }
            });
    
            const conversationsArray = Array.from(uniqueConversations.values());
            console.log("Final Conversations:", conversationsArray); // Debugging output
    
            res.json(conversationsArray);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// Send a message
router.post("/send", async (req, res) => {
  const { roomId, senderEmail, receiverEmail, message } = req.body;

  try {
    const chatMessage = new Chat({ roomId, senderEmail, receiverEmail, message, timestamp: new Date() });
    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
});

// Get all messages in a chat room
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Chat.find({ roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

// Fetch all chats for a user
router.get("/user/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;

    const chats = await Chat.find({
      $or: [{ senderEmail: userEmail }, { receiverEmail: userEmail }],
    }).sort({ timestamp: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error });
  }
});

// Get chat messages between two users
router.get("/:senderEmail/:receiverEmail", async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.params;

    const messages = await Chat.find({
      $or: [
        { senderEmail, receiverEmail },
        { senderEmail: receiverEmail, receiverEmail: senderEmail },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
});




module.exports = router;
