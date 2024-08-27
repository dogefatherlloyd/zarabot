import { Server } from "socket.io";
import { createServer } from "http";

const server = createServer();
const io = new Server(server, {
  path: "/api/socket",
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("Initializing socket.io...");
    res.socket.server.io = io;
    io.attach(res.socket.server);

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });
  }

  res.end();
};

export default handler;