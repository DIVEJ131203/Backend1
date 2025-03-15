import humanizeDuration from "humanize-duration";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyCourses } from "../assets/assets";

export const AppContext = createContext(); // ✅ Creating Context

export const AppContextProvider = ({ children }) => {
    // ✅ State Variables
    const [currency, setCurrency] = useState("$");
    const [allCourses, setAllCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true); // ✅ Set isEducator to true

    const navigate = useNavigate();

    // ✅ Fetch all courses (Simulated API Call)
    const fetchAllCourses = async () => {
        try {
            setAllCourses(dummyCourses);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    // ✅ Fetch enrolled courses (Simulated API Call)
    const fetchUserEnrolledCourses = async () => {
        setEnrolledCourses(dummyCourses);
    };

    // ✅ Navigate to course page
    const goToCourse = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    useEffect(() => {
        setCurrency(import.meta.env.VITE_CURRENCY || "$"); // ✅ Default to "$"
        fetchAllCourses();
        fetchUserEnrolledCourses();
    }, []);

    // ✅ Calculate total chapter time
    const calculateChapterTime = (chapter) => {
        let time = chapter.chapterContent.reduce((acc, lecture) => acc + lecture.lectureDuration, 0);
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    // ✅ Calculate total course duration
    const calculateCourseDuration = (course) => {
        let time = course.courseContent.reduce(
            (acc, chapter) => acc + chapter.chapterContent.reduce((subAcc, lecture) => subAcc + lecture.lectureDuration, 0),
            0
        );
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    // ✅ Calculate number of lectures in a course
    const calculateNoOfLectures = (course) => {
        return course.courseContent.reduce((acc, chapter) => acc + chapter.chapterContent.length, 0);
    };

    return (
        <AppContext.Provider
            value={{
                currency,
                allCourses,
                goToCourse,
                calculateNoOfLectures,
                calculateCourseDuration,
                calculateChapterTime,
                enrolledCourses,
                setEnrolledCourses,
                fetchUserEnrolledCourses,
                isEducator, // ✅ Added isEducator
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
