import mongoose from "mongoose";
import stripe from "stripe";
import { Webhook } from "svix";
import Course from "../models/course.js";
import { Purchase } from "../models/purchase.js";
import User from "../models/User.js";



// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
  try {

    // Create a Svix instance with clerk webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // Verifying Headers
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    })

    // Getting Data from request body
    const { data, type } = req.body

    // Switch Cases for differernt Events
    switch (type) {
      case 'user.created': {

        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
          resume: ''
        }
        await User.create(userData)
        res.json({})
        break;
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }
        await User.findByIdAndUpdate(data.id, userData)
        res.json({})
        break;
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id)
        res.json({})
        break;
      }
      default:
        break;
    }

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// Stripe Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)


// Stripe Webhooks to Manage Payments Action
export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe Webhook Signature Error:", err);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`✅ Stripe Webhook Verified: ${event.type}`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        console.log("✅ Payment Succeeded Event Detected");

        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        console.log(`🔍 Fetching session data for Payment Intent: ${paymentIntentId}`);

        // Fetch the Stripe session using Payment Intent
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!sessionList.data.length) {
          console.error("❌ No matching session found for Payment Intent.");
          return response.status(400).json({ success: false, message: "Session not found" });
        }

        const { purchaseId } = sessionList.data[0].metadata;
        console.log(`📦 Purchase ID from metadata: ${purchaseId}`);

        if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
          console.error("❌ Invalid Purchase ID format:", purchaseId);
          return response.status(400).json({ success: false, message: "Invalid Purchase ID" });
        }

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.error(`❌ Purchase not found: ${purchaseId}`);
          return response.status(404).json({ success: false, message: "Purchase not found" });
        }

        console.log(`✅ Found Purchase Data: ${JSON.stringify(purchaseData)}`);

        const userData = await User.findById(purchaseData.userId);
        if (!userData) {
          console.error(`❌ User not found: ${purchaseData.userId}`);
          return response.status(404).json({ success: false, message: "User not found" });
        }

        console.log(`✅ Found User Data: ${JSON.stringify(userData)}`);

        // **Fix: Ensure `courseId` is a valid ObjectId**
        const courseId = purchaseData.courseId.toString().trim();
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          console.error("❌ Invalid Course ID format:", courseId);
          return response.status(400).json({ success: false, message: "Invalid Course ID" });
        }

        const courseData = await Course.findById(courseId);
        if (!courseData) {
          console.error(`❌ Course not found: ${courseId}`);
          return response.status(404).json({ success: false, message: "Course not found" });
        }

        console.log(`✅ Found Course Data: ${JSON.stringify(courseData)}`);

        // Prevent duplicate enrollments
        if (!courseData.enrolledStudents.includes(userData._id)) {
          courseData.enrolledStudents.push(userData._id);
          await courseData.save();
          console.log(`✅ User ${userData._id} enrolled in course ${courseData._id}`);
        } else {
          console.log(`⚠️ User ${userData._id} is already enrolled in course ${courseData._id}`);
        }

        if (!userData.enrolledCourses.includes(courseData._id)) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
        }

        purchaseData.status = "completed";
        await purchaseData.save();

        console.log(`✅ Purchase status updated to 'completed' for purchaseId: ${purchaseId}`);
        break;
      }

      default:
        console.log(`⚠️ Unhandled Stripe event type: ${event.type}`);
    }

    return response.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return response.status(500).json({
      success: false,
      message: "Webhook processing error",
      error: error.message,
    });
  }
};