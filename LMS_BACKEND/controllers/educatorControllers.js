import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from 'cloudinary';
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";

export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId; // Ensure req.auth exists
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        await clerkClient.users.updateUser(userId, {
            publicMetadata: { role: "educator" }
        });

        res.json({ success: true, message: "You can publish a course now" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



//Add new Course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail not attached" });
        }

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = educatorId;

        const newCourse = await Course.create(parsedCourseData);

        // ✅ Correct cloudinary upload function
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);

        newCourse.courseThumbnail = imageUpload.secure_url;
        await newCourse.save();

        res.json({ success: true, message: "Course Added" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//Get educator courses
export const getEducatorCourses= async(req,res)=>{
    try {
        const educator = req.auth.userId;
        const courses=await Course.find({educator})
        res.json({success:true,courses})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}


//EducatorDashboard Data
export const EducatorDashboardData=async(req,res)=>{
    try {
        const educator=req.auth.userId;
        const courses=await Course.find({educator});
        const totalCourses= courses.length;

        const courseIds=courses.map(course=>course._id);
        // calculate totalEarnings
        const purchases=await Purchase.find({
            courseId:{$in: courseIds},
            status:'completed'
        })
        const totalEarnings=purchases.reduce((sum,purchase)=>sum+purchase.amount,0);

        //Collect students enrolled
        const enrolledStudentsData=[];
        for(const course of courses){
            const students=await User.find({
                _id:{$in: course.enrolledStudents}
            },'name image_url')
            students.forEach(element => {
                enrolledStudentsData.push({
                    courseTitle:course.courseTitle,
                    student
                })
            });
        }
        res.json({success:true,dashBoardData:{
            totalEarnings,
            enrolledStudentsData,
            totalCourses
        }})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//Get enrolled students data and purchase data
export const getEnrolledStudentsData=async(req,res)=>{
    try {
        const educator = req.auth.userId;
        const courses=await Course.find({educator});
        const courseIds=courses.map(course=>course._id);
        const purchases=await Purchase.find({
                        courseId:{$in: courseIds},
            status:'completed'
        }).populate('userId','name image_url').populate('courseId','courseTitle')

        const enrolledStudents=purchases.map(purchase=>({
            student:purchase.userId,
            courseTitle:purchase.courseId.courseTitle,
            purchaseDate:purchase.createdAt
        }))
        res.json({success:true,enrolledStudents})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

