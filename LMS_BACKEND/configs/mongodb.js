import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const ConnectDB = async () => {
    try {
        console.log("MongoDB URI:", process.env.MONGODB_URI); // Debugging
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined!");
        }

        await mongoose.connect(`${process.env.MONGODB_URI}/lms`);
        console.log("Database Connected");

    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1); // Stop the process on failure
    }
};

export default ConnectDB;

