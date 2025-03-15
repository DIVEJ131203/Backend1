import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../Context/AppContext';
import CourseCard from './courseCard'; // ✅ Fixed component name

const CoursesSection = () => {
    const { allCourses } = useContext(AppContext);

    return (
        <div className='py-16 md:px-40 px-8'>
            <h2 className='text-3xl font-medium text-gray-800'>Learn from the best</h2>
            <p className='text-small md:text-base text-gray-500 mt-3'>
                Discover our top-rated courses across various categories. From coding and design to 
                <br />
                business and wellness, our courses are crafted to deliver results.
            </p>
            
            <div className="grid  grid-cols-auto gap-6 mt-6 md:px-0 my-10 gap-4 ">
                {allCourses.slice(0, 4).map((course, index) => (
                    <CourseCard key={index} course={course} /> // ✅ Fixed component name
                ))}
            </div>

            <Link to={'/course-list'} onClick={() => window.scrollTo(0, 0)} className='block mt-6 text-gray-500 border border-gray-500/30 px-10 py-3 rounded text-center'>
                Show all courses
            </Link>
        </div>
    );
};

export default CoursesSection;
