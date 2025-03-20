import mongoose from "mongoose";
import Stripe from "stripe";
import Course from "../models/course.js";
import { CourseProgress } from "../models/courseProgress.js";
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

export const updateUserCoursePrgress= async(req,res)=>{
    try {
        const userId=req.auth.userId
        const {courseId,lectureId}=req.body

        const progressData= await CourseProgress.findOne({userId, courseId})
        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({success:true, message:"lecture already completed"})
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        }
        else{
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted:[lectureId]
            })
        }
        res.json({success:true,message:"Progress updated(lecture complete)"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const getUserCourseProgress=async(req,res)=>{
    try {
        const userId=req.auth.userId
        const {courseId}=req.body
        const progressData= await CourseProgress.findOne({userId, courseId})
        res.json({success:true,progressData})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}


export const addUserRating=async(req,res)=>{
    const userId=req.auth.userId
    const {courseId,rating}=req.body
    if(!courseId || !userId || !rating||rating<1||rating>5){
        res.json({success:false,message:"invalid Details"})
    }
    try {
        const course=await Course.findById(courseId);
        if(!courseId){
            res.json({success:false,message:"course not found"})
        }
        const user=await User.findById(userId);
        if(!user|| !user.enrolledCourses.includes(courseId)){
            res.json({success:false,message:"user hasn't purchased the course"})
        }
        const existingRatingIndex=course.courseRatings.findIndex(r=>r.userId=== userId)
        if(existingRatingIndex>-1){
            course.courseRatings[existingRatingIndex].rating=rating;
        }
        else{
            course.courseRatings.push({
                userId,rating
            });
        }
        await course.save();
        return res.json({success:true,message:"Rating Added"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}