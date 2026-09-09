import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import { app, server } from "./lib/socket.js";

dotenv.config();
connectDB();

app.set("trust proxy", 1);

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { message: "Too many requests, please try again later." },
    validate: { xForwardedForHeader: false },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many authentication attempts, please try again later." },
    validate: { xForwardedForHeader: false },
});

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/messages", messageRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send("Server status: online");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});