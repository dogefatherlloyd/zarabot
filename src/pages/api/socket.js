import { Server } from "socket.io";
import { createServer } from "http";

// Ensure the runtime is Node.js and not Edge
export const config = {
  api: {
    bodyParser: false,
  },
};

let io;

const handler = (req, res) => {
  // Check if the server already has socket.io initialized
  if (!res.socket.server.io) {
    console.log("Initializing socket.io...");
    const httpServer = createServer((req, res) => res.end());
    io = new Server(httpServer, {
      path: "/api/socket",
      cors: {
        origin: "*",
      },
    });

    // Attach the socket server to the Next.js response socket
    res.socket.server.io = io;

    // Set up socket connection
    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    // Attach the HTTP server to the response socket
    io.attach(res.socket.server);
  } else {
    console.log("Socket.io already initialized.");
  }

  res.end();
};

export default handler;