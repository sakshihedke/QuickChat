import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from "http";
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from "socket.io";

//create express app and http server
const app = express();
const server = http.createServer(app);

// Intialize socket.io
export const io = new Server(server, {cors: {origin: "*"}});


// store online users
export const userSocketMap = {};

// socket.io connect handler 
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("sendMessage", ({ receiverId, message }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message); // ✅ ONLY receiver
        }
    });



    socket.on("disconnect", () => {
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});


// middleware setup

app.use(express.json({limit: '4mb'}));
app.use(cors());

// routes setup
app.use("/api/status", (req, res)=> res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);


await connectDB();
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

// export server for vercel
export default server;