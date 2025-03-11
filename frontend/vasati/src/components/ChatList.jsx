import { useEffect, useState } from "react";
import axios from "axios";
import socket from "./socket";
import ChatModal from "./ChatModal";
import "./ChatList.css"; // Import CSS file

const ChatList = () => {
  const userEmail = localStorage.getItem("userEmail");
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyMessages, setReplyMessages] = useState({});

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chat/conversations/${userEmail}`,
          {
            headers: { "Cache-Control": "no-cache" },
          }
        );
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
    socket.connect();

    const handleReceiveMessage = (newMessage) => {
      console.log("Received new message:", newMessage);

      setConversations((prevConversations) => {
        let updatedConversations = prevConversations.map((chat) =>
          (chat.senderEmail === newMessage.senderEmail &&
            chat.receiverEmail === newMessage.receiverEmail) ||
          (chat.senderEmail === newMessage.receiverEmail &&
            chat.receiverEmail === newMessage.senderEmail)
            ? { ...chat, message: newMessage.message }
            : chat
        );

        const isNewChat = !updatedConversations.some(
          (chat) =>
            chat.senderEmail === newMessage.senderEmail &&
            chat.receiverEmail === newMessage.receiverEmail
        );

        if (isNewChat) {
          updatedConversations = [...updatedConversations, newMessage];
        }

        return updatedConversations;
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [userEmail]);

  const handleSendReply = async (receiverEmail, event) => {
    event?.preventDefault();

    const message = replyMessages[receiverEmail]?.trim();
    if (!message) return;

    try {
      const msgData = { senderEmail: userEmail, receiverEmail, message };

      await axios.post("http://localhost:5000/api/chat/send", msgData);
      socket.emit("sendMessage", msgData);

      setReplyMessages((prev) => ({ ...prev, [receiverEmail]: "" }));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2>Chats</h2>
        {conversations.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <ul className="chat-list">
            {conversations.map((chat, index) => {
              const otherUser =
                chat.senderEmail === userEmail
                  ? chat.receiverEmail
                  : chat.senderEmail;
              return (
                <li
                  key={index}
                  className={`chat-item ${
                    selectedChat === otherUser ? "active" : ""
                  }`}
                  onClick={() => setSelectedChat(otherUser)}
                >
                  <span className="chat-user">{otherUser}</span>
                  <span className="chat-preview">{chat.message}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="chat-window">
        {selectedChat ? (
          <ChatModal
            roomId={`${userEmail}_${selectedChat}`}
            senderEmail={userEmail}
            receiverEmail={selectedChat}
            onClose={() => setSelectedChat(null)}
          />
        ) : (
          <p className="no-chat">Select a chat to start messaging</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
