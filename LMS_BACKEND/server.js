import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import express from "express";
import connectCloudinary from "./configs/cloudinary.js";
import ConnectDB from "./configs/mongodb.js";
import { clerkWebHooks, stripeWebhooks } from "./controllers/webhooks.js";
import courseRouter from "./Routes/courseRoutes.js";
import educatorRouter from "./Routes/educatorRoutes.js";
import userRouter from "./Routes/userRoutes.js";

const app = express();

// Stripe Webhook: Use express.raw() for this route only
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Apply JSON Middleware for all other routes
app.use(express.json());
app.use(cors());

// Debugging Middleware (avoiding req.body logging for Stripe)
app.use((req, res, next) => {
    console.log(`🌐 Received Request: ${req.method} ${req.url}`);
    console.log(`📩 Headers:`, req.headers);
    if (req.url !== "/stripe") console.log(`📦 Body:`, req.body); // Avoid raw body logging
    next();
});

// Apply Clerk Middleware AFTER Stripe webhook but BEFORE routes
app.use(clerkMiddleware());

// Async function to start the server
const startServer = async () => {
    try {
        await ConnectDB();
        console.log("✅ MongoDB Connected Successfully");
        await connectCloudinary();
        console.log("✅ Cloudinary Connected Successfully");

        // Routes (added after successful DB connection)
        app.use("/api/educator", educatorRouter);
        app.use("/api/course", courseRouter);
        app.use("/api/user", userRouter);

        // Clerk Webhooks
        app.post("/clerk", clerkWebHooks);

        // Root Route
        app.get("/", (req, res) => {
            res.send("API Working");
        });

        // Start Server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("❌ Database Connection Failed:", error);
        process.exit(1);
    }
};

// Start the server
startServer();
