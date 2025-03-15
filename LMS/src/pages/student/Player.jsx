import humanizeDuration from 'humanize-duration'; // ✅ Added missing import
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import { assets } from '../../assets/assets';
import Footer from '../../Components/student/footer';
import Rating from '../../Components/student/rating';
import { AppContext } from '../../Context/AppContext';

const Player = () => {
    const { enrolledCourses, calculateChapterTime } = useContext(AppContext);
    const { courseId } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [openSections, setOpenSections] = useState({});
    const [playerData, setPlayerData] = useState(null);

    const toggleSection = (index) => {
        setOpenSections((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const getCourseData = () => {
        const selectedCourse = enrolledCourses.find(course => course._id === courseId);
        if (selectedCourse) {
            setCourseData(selectedCourse);
        }
    };

    useEffect(() => {
        getCourseData();
    }, [enrolledCourses, courseId]); // ✅ Fixed missing dependency array

    return (
        <>
            <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
                {/* Left Column */}
                <div className='text-gray-800'>
                    <h2 className='text-xl font-semibold'>Course Structure</h2>
                    <div className='pt-5'>
                        {courseData &&
                            courseData.courseContent.map((chapter, index) => (
                                <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                                    <div
                                        className='flex items-center justify-between px-4 py-3 cursor-pointer select-none'
                                        onClick={() => toggleSection(index)}
                                    >
                                        <div className='flex items-center gap-2'>
                                            <img
                                                className={`transform transition-transform ${
                                                    openSections[index] ? 'rotate-180' : ''
                                                }`}
                                                src={assets.down_arrow_icon}
                                                alt='arrow-icon'
                                            />
                                            <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                                        </div>
                                        <p className='text-sm md:text-default'>
                                            {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                                        </p>
                                    </div>

                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${
                                            openSections[index] ? 'max-h-96' : 'max-h-0'
                                        }`}
                                    >
                                        <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                                            {chapter.chapterContent.map((lecture, i) => (
                                                <li key={i} className='flex items-start gap-2 py-1'>
                                                    <img
                                                        src={false ? assets.blue_tick_icon : assets.play_icon}
                                                        alt='play-icon'
                                                        className='w-4 h-4 mt-1'
                                                    />
                                                    <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                                                        <p>{lecture.lectureTitle}</p>
                                                        <div className='flex gap-2'>
                                                            {lecture.lectureUrl && (
                                                                <p
                                                                    onClick={() =>
                                                                        setPlayerData({
                                                                            ...lecture,
                                                                            chapter: index + 1,
                                                                            lecture: i + 1,
                                                                        })
                                                                    }
                                                                    className='text-blue-500 cursor-pointer'
                                                                >
                                                                    Watch
                                                                </p>
                                                            )}
                                                            <p>
                                                                {humanizeDuration(lecture.lectureDuration * 60 * 1000, {
                                                                    language: 'en',
                                                                    units: ['h', 'm'],
                                                                    round: true,
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div className='flex items-center gap-2 py-3 mt-10'>
                        <h1 className='text-xl font-bold'>Rate this course</h1>
                        <Rating initialRating={0}/>
                    </div>
                </div>

                {/* Right Column */}
                <div className='md:mt-10'>
                    {playerData ? (
                        <div>
                            <YouTube
                                videoId={playerData?.lectureUrl?.split('/').pop() || ''}
                                opts={{ playerVars: { autoplay: 1 } }}
                                iframeClassName='w-full aspect-video'
                            />
                        </div>
                    ) : (
                        <img
                            src={courseData?.courseThumbnail || assets.placeholder_image}
                            alt={courseData?.courseTitle || 'Course Thumbnail'}
                        />
                    )}
                    <div className='flex justify-between items-center mt-1'>
                        {playerData ? (
                            <p>
                                {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                            </p>
                        ) : (
                            <p>Select a lecture to watch</p>
                        )}
                        <button className='text-blue-600'>{false ? 'Completed' : 'Mark Complete'}</button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Player;

