import Quill from 'quill';
import React, { useEffect, useRef, useState } from 'react';
import uniqid from 'uniqid';
import { assets } from '../../assets/assets';

const AddCourse = () => {
    const quillRef = useRef(null);
    const editorRef = useRef(null);

    const [courseTitle, setCourseTitle] = useState('');
    const [coursePrice, setCoursePrice] = useState('0');
    const [discount, setDiscount] = useState('0');
    const [image, setImage] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [currentChapterId, setCurrentChapterId] = useState(null);
    const [lectureDetails, setLectureDetails] = useState({
        lectureTitle: '',
        lectureDuration: '',
        lectureUrl: '',
        isPreviewFree: false,
    });

    useEffect(() => {
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
            });
        }
    }, []);

    const handleChapter = (action, chapterId) => {
        if (action === 'add') {
            const title = prompt("Enter Chapter Name:");
            if (title) {
                const newChapter = {
                    chapterId: uniqid(),
                    chapterTitle: title,
                    chapterContent: [],
                    collapsed: false,
                    chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
                };
                setChapters([...chapters, newChapter]);
            }
        } else if (action === 'remove') {
            setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
        } else if (action === 'toggle') {
            setChapters(chapters.map(chapter =>
                chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
            ));
        }
    };

    const addLecture = () => {
        setChapters(chapters.map(chapter =>
            chapter.chapterId === currentChapterId
                ? {
                    ...chapter,
                    chapterContent: [
                        ...chapter.chapterContent,
                        { id: uniqid(), ...lectureDetails }
                    ]
                }
                : chapter
        ));
        setShowPopup(false);
        setLectureDetails({ lectureTitle: '', lectureDuration: '', lectureUrl: '', isPreviewFree: false });
    };

    const handleSubmit=async(e)=>{
        e.preventDefault()
    }
    return (
        <div className='h-screen overflow-scroll flex flex-col items-start justify-between p-4 pt-8'>
            <form onClick={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
                <div className='flex flex-col gap-1'>
                    <p>Course Title</p>
                    <input type="text" placeholder='Type Here' className='outline-none py-2 px-3 rounded border border-gray-500' required value={courseTitle} onChange={e => setCourseTitle(e.target.value)} />
                </div>

                <div className='flex flex-col gap-1'>
                    <p>Course Description</p>
                    <div ref={editorRef} className="border border-gray-300 rounded p-2"></div>
                </div>

                <div className='flex items-center justify-between flex-wrap'>
                    <div className='flex flex-col gap-1'>
                        <p>Course Price ($)</p>
                        <input type="number" placeholder='0' className='outline-none py-2 w-28 px-3 rounded border border-gray-500' value={coursePrice} onChange={e => setCoursePrice(e.target.value)} />
                    </div>
                    <div className='flex md:flex-row flex-col items-center gap-3'>
                        <p>Course Thumbnail</p>
                        <label htmlFor="thumbnailImage" className='flex items-center gap-3 cursor-pointer'>
                            <img src={assets.file_upload_icon} alt="Upload Icon" className='p-3 bg-blue-500 rounded' />
                            <input type="file" id='thumbnailImage' onChange={e => setImage(e.target.files[0])} accept='image/*' hidden />
                            {image && <img src={URL.createObjectURL(image)} alt="Course Thumbnail" className='max-h-10 rounded' />}
                        </label>
                    </div>
                </div>

                <div className='flex flex-col gap-1'>
                    <p>Discount %</p>
                    <input type="number" placeholder='0' min={0} max={100} className='outline-none py-2 w-28 px-3 rounded border border-gray-500' required value={discount} onChange={e => setDiscount(e.target.value)} />
                </div>

                <div>
                    {chapters.map((chapter) => (
                        <div key={chapter.chapterId} className='bg-white border rounded-lg mb-4'>
                            <div className='flex justify-between items-center p-4 border-b'>
                                <div className='flex items-center'>
                                    <img
                                        src={assets.dropdown_icon}
                                        width={14}
                                        alt=""
                                        className={`mr-2 cursor-pointer transition-all ${chapter.collapsed ? "-rotate-90" : ""}`}
                                        onClick={() => handleChapter('toggle', chapter.chapterId)}
                                    />
                                    <span className='font-semibold'>{chapter.chapterTitle}</span>
                                </div>
                                <span className='text-gray-500'>{chapter.chapterContent.length} Lectures</span>
                                <img
                                    src={assets.cross_icon}
                                    alt=""
                                    className='cursor-pointer'
                                    onClick={() => handleChapter('remove', chapter.chapterId)}
                                />
                            </div>

                            {!chapter.collapsed && (
                                <div className="p-4">
                                    {chapter.chapterContent.map(lecture => (
                                        <div key={lecture.id} className="p-2 border rounded my-2">
                                            <p className="font-semibold">{lecture.lectureTitle}</p>
                                            <p>Duration: {lecture.lectureDuration} min</p>
                                            <a href={lecture.lectureUrl} className="text-blue-500">Watch</a>
                                            <p className="text-sm">{lecture.isPreviewFree ? "✅ Free Preview" : "🔒 Paid"}</p>
                                        </div>
                                    ))}
                                    <button
                                        className='bg-blue-500 text-white px-4 py-2 rounded mt-2'
                                        onClick={() => { setCurrentChapterId(chapter.chapterId); setShowPopup(true); }}
                                    >
                                        + Add Lecture
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer' onClick={() => handleChapter('add')}>
                        + Add Chapter
                    </div>
                </div>

                {showPopup && (
                    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
                        <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
                            <h2 className='text-lg font-semibold mb-4'>Add Lecture</h2>
                            <input type="text" placeholder="Lecture Title" className='w-full border rounded py-1 px-2 mb-2' value={lectureDetails.lectureTitle} onChange={e => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })} />
                            <input type="number" placeholder="Duration (min)" className='w-full border rounded py-1 px-2 mb-2' value={lectureDetails.lectureDuration} onChange={e => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })} />
                            <input type="text" placeholder="Lecture URL" className='w-full border rounded py-1 px-2 mb-2' value={lectureDetails.lectureUrl} onChange={e => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })} />
                            <div className='flex items-center gap-2 mb-4'>
                                <input type="checkbox" checked={lectureDetails.isPreviewFree} onChange={e => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })} />
                                <p>Is Preview Free?</p>
                            </div>
                            <button onClick={addLecture} className='w-full bg-blue-400 text-white px-4 py-2 rounded'>Add</button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddCourse;
