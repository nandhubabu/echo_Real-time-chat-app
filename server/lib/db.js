// lib/db.js
import mongoose from 'mongoose';
import dns from 'dns';

// Fix for querySrv ECONNREFUSED on Windows local networks/ISPs that do not resolve SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    // Ignore if not supported in environment
}

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("❌ ERROR: MONGO_URI is not defined in .env file!");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
};