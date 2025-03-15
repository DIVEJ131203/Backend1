import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import CourseCard from '../../Components/student/courseCard';
import Footer from '../../Components/student/footer';
import SearchBar from '../../Components/student/searchbar';
import { AppContext } from '../../Context/AppContext'; // ✅ Import AppContext

const CoursesList = () => {
  const navigate = useNavigate();
  const { input } = useParams(); // ✅ Ensure input is correctly accessed
  const { allCourses } = useContext(AppContext);
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const tempCourses = [...allCourses];

      if (input) {
        setFilteredCourses(
          tempCourses.filter((item) =>
            item.courseTitle.toLowerCase().includes(input.toLowerCase()) // ✅ Fixed `includes()`
          )
        );
      } else {
        setFilteredCourses(tempCourses);
      }
    }
  }, [allCourses, input]); // ✅ Added dependencies

  return (
    <>
    <div className="relative md:px-36 px-8 pt-20 text-left">
      <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
        <div>
          <h1 className="text-4xl font-semibold text-gray-800">Course List</h1>
          <p className="text-gray-500">
            <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/')}>
              Home
            </span> 
            {' '} / <span>Course List</span>
          </p>
        </div>
        <SearchBar searchQuery={input} />
      </div>
{
    input && <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600'>
        <p>{input}</p>
        <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={()=>{
            navigate('/course-list')
        }} />
        </div>
}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => <CourseCard key={index} course={course} />)
        ) : (
          <p className="text-gray-500">No courses found.</p>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default CoursesList;


