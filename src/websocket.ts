// import { Server as SocketIOServer } from "socket.io";

// let io: SocketIOServer | null = null;

// export function setIo(server: SocketIOServer) {
// 	io = server;
// }

// export function emitEvent(event: string, payload: Record<string, unknown> = {}) {
// 	if (!io) return;
// 	io.emit(event, payload);
// }

//FOR PRODUCTION USE ONLY
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function setIo(server: SocketIOServer): void {
  if (io) {
    console.warn("Socket.IO instance already set, overwriting");
  }
  io = server;
}

export function emitEvent(
  event: string,
  payload: Record<string, any> = {}
): void {
  if (!io) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[WebSocket] emitEvent called before io was set: ${event}`);
    }
    return;
  }
  io.emit(event, payload);
}
