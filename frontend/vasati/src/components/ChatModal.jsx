import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import socket from "./socket"; // Import shared WebSocket
import "./ChatModal.css";

function ChatModal({ roomId, senderEmail, receiverEmail, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chat/${senderEmail}/${receiverEmail}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    socket.connect(); // Ensure connection
    socket.emit("joinRoom", { roomId });

    const handleReceiveMessage = (newMsg) => {
      if (
        (newMsg.senderEmail === senderEmail &&
          newMsg.receiverEmail === receiverEmail) ||
        (newMsg.senderEmail === receiverEmail &&
          newMsg.receiverEmail === senderEmail)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMsg]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [roomId, senderEmail, receiverEmail]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const msgData = {
        roomId,
        senderEmail,
        receiverEmail,
        message: newMessage,
      };

      await axios.post("http://localhost:5000/api/chat/send", msgData);
      socket.emit("sendMessage", msgData); // Emit real-time event

      setMessages((prevMessages) => [...prevMessages, msgData]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-modal">
      <div className="chat-header">
        <h4>Chat with {receiverEmail}</h4>
        <button onClick={onClose}>X</button>
      </div>
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.senderEmail === senderEmail ? "sent" : "received"
            }`}
          >
            <p>{msg.message}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatModal;
