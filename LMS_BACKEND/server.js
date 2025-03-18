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

// Place Clerk Middleware First
app.use(clerkMiddleware());

app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));
app.use(cors());

// Debugging Middleware
app.use((req, res, next) => {
    console.log(`🌐 Received Request: ${req.method} ${req.url}`);
    console.log(`📩 Headers:`, req.headers);
    console.log(`📦 Body:`, req.body);
    next();
});

// Async function to start the server
const startServer = async () => {
    try {
        await ConnectDB();
        console.log("✅ MongoDB Connected Successfully");
        await connectCloudinary();

        // Routes should be added after DB is connected
        app.use('/api/educator', educatorRouter);
        app.use('/api/course',express.json(),courseRouter)
        app.use('/api/user',express.json(),userRouter)
        app.post("/stripe",express.raw({type:'application/json'}),stripeWebhooks)
        app.post("/clerk", clerkWebHooks);
        
        app.get("/", (req, res) => {
            res.send("API Working");
        });

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
