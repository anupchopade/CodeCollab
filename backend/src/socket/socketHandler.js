
import { Server } from "socket.io";
import { handleDocumentEvents } from './documentEvents.js';
import { handleCursorEvents } from './cursorEvents.js';

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: ["http://localhost:5173"], credentials: true },
    pingTimeout: 30000,
    methods: ['GET', 'POST'], // helps detect dead clients
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    handleDocumentEvents(socket,io);
    handleCursorEvents(socket,io);

    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.id} (Reason: ${reason})`);
      
    });
  });

  return io;
}
