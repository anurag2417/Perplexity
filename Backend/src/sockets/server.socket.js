import { Server } from "socket.io";


let io;

export function initSocket(httpServer) {
    const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        }
    })

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id)
    })
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}