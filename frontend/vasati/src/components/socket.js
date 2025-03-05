import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false, // Prevents auto connection
  transports: ["websocket"], // Ensures WebSocket-only connection
});

export default socket;
