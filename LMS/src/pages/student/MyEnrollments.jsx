import { Line } from 'rc-progress';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../Components/student/footer';
import { AppContext } from '../../Context/AppContext';

const MyEnrollments = () => {
    const { enrolledCourses, calculateCourseDuration } = useContext(AppContext);
    const navigate=useNavigate();
    
    const [progressArray, setProgressArray] = useState([
        { lectureCompleted: 2, totalLectures: 4 },
        { lectureCompleted: 1, totalLectures: 5 },
        { lectureCompleted: 3, totalLectures: 6 },
        { lectureCompleted: 4, totalLectures: 4 },
        { lectureCompleted: 0, totalLectures: 5 },
        { lectureCompleted: 0, totalLectures: 5 },
        { lectureCompleted: 3, totalLectures: 6 },
        { lectureCompleted: 4, totalLectures: 10 },
        { lectureCompleted: 3, totalLectures: 5 },
        { lectureCompleted: 7, totalLectures: 7 },
        { lectureCompleted: 1, totalLectures: 4 },
        { lectureCompleted: 0, totalLectures: 2 },
        { lectureCompleted: 5, totalLectures: 5 }
    ]);

    return (
        <>
        <div className='md:px-36 px-8 md:pt-20 pt-10'>
            <h2 className="text-2xl font-semibold text-gray-800">My Enrollments</h2>
            <table className='mt-10 w-full border border-gray-300'>
                <thead className='bg-gray-100 border-b border-gray-300 text-left'>
                    <tr>
                        <th className='px-4 py-3 font-semibold'>Course</th>
                        <th className='px-4 py-3 font-semibold max-sm:hidden'>Duration</th>
                        <th className='px-4 py-3 font-semibold max-sm:hidden'>Progress</th>
                        <th className='px-4 py-3 font-semibold'>Status</th>
                    </tr>
                </thead>
                <tbody className='text-gray-700'>
                    {enrolledCourses.map((course, index) => (
                        <tr className='border-b border-gray-300' key={index}>
                            <td className='px-4 py-3 flex items-center space-x-3'>
                                <img src={course.courseThumbnail} alt="" className='w-14 sm:w-24 md:w-28 rounded-md' />
                                <div className='flex-1'>
                                <span className='font-medium'>{course.courseTitle}</span>
                                <Line strokeWidth={2} percent={progressArray[index] ?
                                    (progressArray[index].lectureCompleted * 100)/progressArray[index].totalLectures : 0
                                } className='bg-gray-300 rounded-full'/>
                                </div>
                            </td>
                            <td className='px-4 py-3 max-sm:hidden'>
                                {calculateCourseDuration(course)}
                            </td>
                            <td className='px-4 py-3 max-sm:hidden'>
                                {progressArray[index] 
                                    ? `${progressArray[index].lectureCompleted}/${progressArray[index].totalLectures}`
                                    : '0/0'
                                } <span>Lectures</span>
                            </td>
                            <td className='px-4 py-3 text-center'>
                                <button className='px-3 sm:px-5 py-1.5 sm:py-2 bg--blue-600 max-sm:text-xs text-white' onClick={()=>navigate('/player/'+course._id)} >
                                <span className='px-3 py-2 text-white bg-blue-600 rounded-md max-sm:text-xs'>
                                    {
                                        progressArray[index] &&progressArray[index].lectureCompleted/progressArray[index].totalLectures  === 1 ?'Completed':'On Going'
                                    }</span></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <Footer/>
        </>
    );
};

export default MyEnrollments;
