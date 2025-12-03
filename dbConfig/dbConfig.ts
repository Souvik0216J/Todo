import mongoose from "mongoose";

let isConnected = false;

export async function connect() {
    if (isConnected) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        isConnected = true;
    } catch (error) {
        throw new Error("Failed to connect to database");
    }
}