import Stripe from "stripe";
import { Webhook } from "svix";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";
import User from "../models/user.js"; // Ensure correct model path

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
                    name: data.first_name + " " + data.last_name,
                    image_url: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                res.json({});
                break;
            }
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                res.json({});
                break;
            }
            default:
                console.warn("⚠️ Unhandled Webhook Type:", type);
                return res.status(400).json({ success: false, message: "Unhandled event type" });
        }
    } catch (error) {
        console.error("❌ Webhook Processing Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;

    console.log("🚀 Incoming Webhook Request...");

    try {
        event = Stripe.webhooks.constructEvent(
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
                console.log("🔄 PaymentIntent Object:", paymentIntent);

                // ✅ Ensure metadata is correctly passed
                const { purchaseId, session_id } = paymentIntent.metadata || {};
                if (!purchaseId || !session_id) {
                    console.error("❌ Missing metadata in PaymentIntent:", paymentIntent.metadata);
                    return response.status(400).json({ success: false, message: "Missing metadata" });
                }

                console.log(`📦 Purchase ID: ${purchaseId}, Session ID: ${session_id}`);

                // ✅ Fetch session details
                const session = await stripeInstance.checkout.sessions.retrieve(session_id);
                if (!session) {
                    console.error("❌ No session found for Session ID:", session_id);
                    return response.status(400).json({ success: false, message: "No session found" });
                }

                console.log("🎟️ Checkout Session Retrieved:", session);

                // ✅ Fetch Purchase, User, and Course data
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

                const courseData = await Course.findById(purchaseData.courseId);
                if (!courseData) {
                    console.error(`❌ Course not found: ${purchaseData.courseId}`);
                    return response.status(400).json({ success: false, message: "Course not found" });
                }

                console.log("👤 User:", userData);
                console.log("📚 Course:", courseData);

                // ✅ Ensure `enrolledStudents` exists
                if (!Array.isArray(courseData.enrolledStudents)) {
                    console.warn("⚠️ `enrolledStudents` not found. Initializing...");
                    courseData.enrolledStudents = [];
                }

                const userObjectId = userData._id.toString();
                
                // ✅ Enroll User in Course
                if (!courseData.enrolledStudents.includes(userObjectId)) {
                    courseData.enrolledStudents.push(userObjectId);
                    await courseData.save();
                    console.log(`✅ User ${userObjectId} enrolled in course ${courseData._id}`);
                } else {
                    console.log(`⚠️ User ${userObjectId} already enrolled in course ${courseData._id}`);
                }

                // ✅ Ensure `enrolledCourses` exists
                if (!Array.isArray(userData.enrolledCourses)) {
                    console.warn("⚠️ `enrolledCourses` not found. Initializing...");
                    userData.enrolledCourses = [];
                }

                // ✅ Add Course to User
                if (!userData.enrolledCourses.includes(courseData._id.toString())) {
                    userData.enrolledCourses.push(courseData._id);
                    await userData.save();
                    console.log(`✅ Course ${courseData._id} added to user ${userObjectId}`);
                } else {
                    console.log(`⚠️ Course ${courseData._id} already in user ${userObjectId} list`);
                }

                // ✅ Update Purchase Status
                console.log("📦 Updating purchase status...");
                await Purchase.findByIdAndUpdate(purchaseId, { status: "completed" });

                console.log("✅ Purchase status updated successfully!");
                break;
            }

            default:
                console.warn(`⚠️ Unhandled event type: ${event.type}`);
        }

        response.json({ received: true });
    } catch (error) {
        console.error("❌ Webhook processing error:", error);
        response.status(500).json({ success: false, message: "Webhook processing error", error: error.message });
    }
};