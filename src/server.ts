import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { app } from "./app.js";
import { setIo } from "./websocket.js";
import "./seed.js";

const port = Number(process.env.PORT || 8080);
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

setIo(io);

server.listen(port, () => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
});
