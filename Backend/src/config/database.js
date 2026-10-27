import mongoose from 'mongoose';
import dns from 'node:dns'; // Key: Import the dns module

// Force DNS servers to be set before connecting
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
