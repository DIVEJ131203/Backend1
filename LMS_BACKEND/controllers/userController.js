import mongoose from "mongoose";
import Stripe from "stripe";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";
import User from "../models/user.js";

export const getUserData = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.auth.userId); // Ensure ObjectId
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, user });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.auth.userId); // Ensure ObjectId
        const userData = await User.findById(userId).populate("enrolledCourses");

        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, enrolledCourses: userData.enrolledCourses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Purchase Course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { userId } = req.auth; // ✅ Clerk userId (string)

        console.log("Received userId:", userId);
        console.log("Received courseId:", courseId);

        // ✅ Validate only `courseId` as ObjectId, `userId` remains a string
        if (!userId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return res.json({ success: false, message: "Invalid userId or courseId format" });
        }

        const courseObjectId = new mongoose.Types.ObjectId(courseId);

        const userData = await User.findById(userId); // Clerk userId is a string
        const courseData = await Course.findById(courseObjectId);

        if (!userData || !courseData) {
            return res.json({ success: false, message: "User or Course not found" });
        }

        // ✅ Calculate final price
        const finalAmount = (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2);

        // ✅ Save Purchase Record in MongoDB
        const newPurchase = await Purchase.create({
            courseId: courseObjectId,
            userId, // Store userId as a string (Clerk format)
            amount: finalAmount,
        });

        // ✅ Stripe Payment Gateway Integration
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = process.env.CURRENCY.toLowerCase();

        const line_items = [
            {
                price_data: {
                    currency,
                    product_data: { name: courseData.courseTitle },
                    unit_amount: Math.floor(finalAmount * 100),
                },
                quantity: 1,
            },
        ];

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${req.headers.origin}/loading/my-enrollments`,
            cancel_url: `${req.headers.origin}`,
            line_items,
            mode: "payment",
            metadata: { purchaseId: newPurchase._id.toString() },
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

