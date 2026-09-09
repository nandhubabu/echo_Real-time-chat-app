import mongoose from 'mongoose';
import dns from 'dns';

try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (error) {
    // Default DNS configuration used
}

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("Database connection error: MONGO_URI is not defined");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
    }
};