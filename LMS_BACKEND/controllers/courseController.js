import Course from "../models/course.js";

//Get all courses
export const getAllCourses=async(req,res)=>{
    try {
        const courses=await Course.find({isPublished:true}).select(['-courseContent','-enrolledStudents']).populate({path:'educator'})
        res.json({success:true,courses})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//get course by id
export const getCourseId= async(req,res)=>{
    const {id}=req.params   
    try {
        const courseData=await Course.findById(id).populate({path:'educator'})
        
        courseData.courseContent.forEach(chapter=>{
            chapter.chapterContent.forEach(lecture=>{
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl="";
                }
            })
        })

        return res.json({success:true,courseData})
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}