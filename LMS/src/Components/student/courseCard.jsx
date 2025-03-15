import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) return 0; // Return 0 for blank stars

    let totalRating = 0;
    course.courseRatings.forEach(rating => {
        totalRating += rating.rating || 0;
    });

    return (totalRating / course.courseRatings.length).toFixed(1); // Return average rating
};

const CourseCard = ({ course }) => {
    const rating = calculateRating(course);
    const totalRatings = course.courseRatings?.length || 0;
    const roundedRating = Math.round(rating); // Round rating to nearest integer for star display

    return (
        <Link to={`/course/${course._id}`} onClick={() => window.scrollTo(0, 0)} className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg'>
            <img className='w-full' src={course.courseThumbnail} alt={course.courseTitle} />

            <div className='p-3 text-left'>
                <h3 className='text-base font-semibold'>{course.courseTitle}</h3>
                <p className='text-gray-500'>Divej Ahuja</p>

                <div className='flex items-center space-x-2 mt-2'>
                    <p>{totalRatings > 0 ? rating : ""}</p> {/* Don't show "N/A", just leave blank */}
                    <div className='flex'>
                        {[...Array(5)].map((_, i) => (
                            <img 
                                key={i} 
                                src={i < roundedRating ? assets.star : assets.star_blank} 
                                alt="star" 
                                className='w-4 h-4' 
                            />
                        ))}
                    </div>
                    <p className='text-gray-500'>({totalRatings})</p>
                </div>

                <p className='text-base font-semibold text-gray-800'>
                    ${ (course.coursePrice - (course.coursePrice * course.discount / 100)).toFixed(2) }
                </p>
            </div>
        </Link>
    );
};

export default CourseCard;
