import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function setIo(server: SocketIOServer) {
	io = server;
}

export function emitEvent(event: string, payload: Record<string, unknown> = {}) {
	if (!io) return;
	io.emit(event, payload);
}


