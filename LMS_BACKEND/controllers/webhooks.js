import mongoose from "mongoose";
import Stripe from "stripe";
import { Webhook } from "svix";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";
import User from "../models/user.js"; // Ensure correct model path

// ✅ Clerk Webhooks
export const clerkWebHooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = req.body;
        console.log(`🔄 Webhook Received: ${type}`);

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || "no-email",
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    image_url: data.image_url || "",
                };

                console.log("📌 Creating User:", userData);
                await User.create(userData);
                console.log("✅ User Created Successfully");
                return res.status(201).json({ success: true, message: "User added" });
            }
            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    image_url: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                return res.json({});
            }
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                return res.json({});
            }
            default:
                console.warn("⚠️ Unhandled Webhook Type:", type);
                return res.status(400).json({ success: false, message: "Unhandled event type" });
        }
    } catch (error) {
        console.error("❌ Clerk Webhook Processing Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Stripe Webhooks
export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;

    console.log("🚀 Incoming Webhook Request...");

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log("✅ Stripe Webhook Verified:", event.type);
    } catch (err) {
        console.error("❌ Stripe Webhook Signature Error:", err.message);
        return response.status(400).send(`Webhook error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const sessionId = paymentIntent.metadata?.session_id;
                const purchaseId = paymentIntent.metadata?.purchaseId;

                if (!sessionId || !purchaseId) {
                    console.error("❌ Missing session ID or purchase ID in metadata.");
                    return response.status(400).json({ success: false, message: "Missing required metadata" });
                }

                console.log(`📦 Fetching session data for Session ID: ${sessionId}`);

                // ✅ Fetch session details properly
                const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
                if (!session) {
                    console.error("❌ No session found for Session ID:", sessionId);
                    return response.status(400).json({ success: false, message: "No session found" });
                }

                console.log(`📦 Purchase ID from metadata: ${purchaseId}`);

                const purchaseData = await Purchase.findById(purchaseId);
                if (!purchaseData) {
                    console.error(`❌ Purchase not found for ID: ${purchaseId}`);
                    return response.status(400).json({ success: false, message: "Purchase not found" });
                }

                const userData = await User.findById(purchaseData.userId);
                if (!userData) {
                    console.error(`❌ User not found: ${purchaseData.userId}`);
                    return response.status(400).json({ success: false, message: "User not found" });
                }

                const courseData = await Course.findById(purchaseData.courseId.toString());
                if (!courseData) {
                    console.error(`❌ Course not found: ${purchaseData.courseId}`);
                    return response.status(400).json({ success: false, message: "Course not found" });
                }

                console.log("👤 Found User:", userData);
                console.log("📚 Found Course:", courseData);

                // ✅ Ensure enrolledStudents array exists
                if (!Array.isArray(courseData.enrolledStudents)) {
                    console.warn("⚠️ `enrolledStudents` is missing. Initializing it.");
                    courseData.enrolledStudents = [];
                }

                const userObjectId = new mongoose.Types.ObjectId(userData._id);

                // ✅ Enroll user in course
                if (!courseData.enrolledStudents.includes(userObjectId.toString())) {
                    courseData.enrolledStudents.push(userObjectId);
                    await courseData.save();
                    console.log(`✅ User ${userData._id} enrolled in course ${courseData._id}`);
                } else {
                    console.log(`⚠️ User ${userData._id} already enrolled in course ${courseData._id}`);
                }

                // ✅ Ensure enrolledCourses array exists
                if (!Array.isArray(userData.enrolledCourses)) {
                    console.warn("⚠️ `enrolledCourses` is missing. Initializing it.");
                    userData.enrolledCourses = [];
                }

                // ✅ Add course to user's enrolled courses
                if (!userData.enrolledCourses.includes(courseData._id.toString())) {
                    userData.enrolledCourses.push(courseData._id);
                    await userData.save();
                    console.log(`✅ Course ${courseData._id} added to user ${userData._id}`);
                } else {
                    console.log(`⚠️ Course ${courseData._id} already in user ${userData._id} list`);
                }

                // ✅ Update purchase status
                console.log("📦 Updating purchase status...");
                await Purchase.updateOne(
                    { _id: purchaseId },
                    { $set: { status: "completed" } }
                );

                console.log("✅ Purchase status updated successfully!");
                break;
            }

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        response.json({ received: true });
    } catch (error) {
        console.error("❌ Webhook processing error:", error);
        response.status(500).json({ success: false, message: "Webhook processing error", error: error.message });
    }
};
