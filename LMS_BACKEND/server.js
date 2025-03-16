import cors from "cors";
import "dotenv/config";
import express from "express";
import ConnectDB from "./configs/mongodb.js";
import { clerkWebHooks } from "./controllers/webhooks.js";

const app = express();
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));
app.use(express.json()); // Ensure JSON parsing

app.use((req, res, next) => {
    console.log(`🌐 Received Request: ${req.method} ${req.url}`);
    console.log(`📩 Headers:`, req.headers);
    console.log(`📦 Body:`, req.body);
    next();
});


// Async function to start the server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await ConnectDB();
        console.log("✅ MongoDB Connected Successfully");

        // Middlewares
        app.use(cors());
        app.use(express.json()); // Ensure JSON body parsing

        // Routes
        app.get("/", (req, res) => {
            res.send("API Working");
        });

        app.post("/clerk", clerkWebHooks);


        // Port
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Database Connection Failed:", error);
        process.exit(1); // Exit process if DB connection fails
    }
};

// Start the server
startServer();
