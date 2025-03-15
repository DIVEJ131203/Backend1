import React, { useEffect, useState } from 'react';
import { dummyStudentEnrolled } from '../../assets/assets';
import Loading from '../student/loading';

const StudentsEnrolled = () => {
    const [enrolledStudents, setEnrolledStudents] = useState(null);

    const fetchEnrolledStudents = async () => {
        setEnrolledStudents(dummyStudentEnrolled);
    };

    useEffect(() => {
        fetchEnrolledStudents();
    }, []);

    return enrolledStudents ? (
        <div className='min-h-screen flex flex-col items-center justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 w-full'>
            <div className='flex flex-col items-center w-full max-w-6xl overflow-x-auto rounded-md bg-white border border-gray-500/20'>
                <table className='w-full table-auto overflow-hidden pb-4 border-collapse'>
                    <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
                        <tr className="bg-gray-100">
                            <th className='px-6 py-4 font-semibold text-center'>#</th>
                            <th className='px-6 py-4 font-semibold text-center'>Student Name</th>
                            <th className='px-6 py-4 font-semibold text-center'>Course Title</th>
                            <th className='px-6 py-4 font-semibold text-center'>Date</th>
                        </tr>
                    </thead>
                    <tbody className='text-sm text-gray-600 w-full'>
                        {enrolledStudents.map((item, index) => (
                            <tr key={index} className='border-b border-gray-500/20 hover:bg-gray-50'>
                                {/* Corrected Index Display */}
                                <td className='px-6 py-4 text-center'>{index + 1}</td>

                                {/* Fixed Image & Name Display */}
                                <td className='px-6 py-4 flex items-center space-x-3 justify-center'>
                                    <img src={item.student.imageUrl} alt={item.student.name} className='w-9 h-9 rounded-full' />
                                    <span>{item.student.name}</span>
                                </td>

                                {/* Course Title */}
                                <td className='px-6 py-4 text-center'>{item.courseTitle}</td>

                                {/* Purchase Date */}
                                <td className='px-6 py-4 text-center'>{new Date(item.purchaseDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ) : <Loading />;
};

export default StudentsEnrolled;
