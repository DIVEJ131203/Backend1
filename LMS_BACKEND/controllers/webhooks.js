import Stripe from "stripe";
import { Webhook } from "svix";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";
import User from "../models/user.js"; // Ensure correct model path

export const clerkWebHooks = async (req, res) => {
    try{
    const whook =new Webhook(process.env.CLERK_WEBHOOK_SECRET)
    await whook.verify(JSON.stringify(req.body),{
        "svix-id":req.headers["svix-id"],
        "svix-timestamp":req.headers["svix-timestamp"],
        "svix-signature":req.headers["svix-signature"]
    })

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
            case 'user.updated':{
                const userData={
                    email:data.email_addresses[0].email_address,
                    name:data.first_name +"" + data.last_name,
                    image_url:data.image_url,

                }
                await User.findByIdAndUpdate(data.id,userData)
                res.json({})
                break;
            
            }

            case 'user.deleted':{
                await User.findByIdAndDelete(data.id)
                res.json({})
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
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body, // Use req.body, not request.body
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook error:", err.message);
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const { purchaseId } = session.metadata; // ✅ Retrieve metadata properly

            if (!purchaseId) {
                console.error("Missing purchaseId in metadata");
                return res.status(400).json({ success: false, message: "Missing purchaseId in metadata" });
            }

            // ✅ Fetch purchase details
            const purchaseData = await Purchase.findById(purchaseId);
            if (!purchaseData) {
                console.error(`Purchase not found: ${purchaseId}`);
                return res.status(400).json({ success: false, message: "Purchase not found" });
            }

            const userData = await User.findById(purchaseData.userId);
            const courseData = await Course.findById(purchaseData.courseId);

            if (!userData || !courseData) {
                console.error("User or course data missing");
                return res.status(400).json({ success: false, message: "User or Course not found" });
            }

            // ✅ Update enrollments
            courseData.enrolledStudents.push(userData._id);
            await courseData.save();

            userData.enrolledCourses.push(courseData._id);
            await userData.save();

            // ✅ Update purchase status
            purchaseData.status = "completed";
            await purchaseData.save();

            console.log(`✅ Payment successful. User ${userData._id} enrolled in ${courseData._id}`);
        } 
        
        else if (event.type === "checkout.session.async_payment_failed") {
            const session = event.data.object;
            const { purchaseId } = session.metadata;

            if (purchaseId) {
                const purchaseData = await Purchase.findById(purchaseId);
                if (purchaseData) {
                    purchaseData.status = "failed";
                    await purchaseData.save();
                }
            }
            console.log(`❌ Payment failed for purchaseId: ${purchaseId}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error.message);
        res.status(500).json({ success: false, message: "Webhook processing error" });
    }
};