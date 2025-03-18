import { requireAuth } from '@clerk/express';
import express from 'express';
import upload from '../configs/multer.js';
import { addCourse, EducatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorControllers.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

// Add educator role using GET (not recommended, but allowed)
educatorRouter.get('/update-role', requireAuth(), updateRoleToEducator);
educatorRouter.post('/add-course',upload.single('image'),protectEducator,addCourse)
educatorRouter.get("/courses",protectEducator,getEducatorCourses)
educatorRouter.get("/dashboard",protectEducator,EducatorDashboardData)
educatorRouter.get("/enrolled-students",protectEducator,getEnrolledStudentsData)

export default educatorRouter;
