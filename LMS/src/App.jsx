import React from 'react';
import { Route, Routes, useMatch } from 'react-router-dom';

// Importing Student Pages
import "quill/dist/quill.snow.css";
import Loading from './Components/student/Loading';
import Navbar from './Components/student/navbar';
import AddCourse from './pages/educator/AddCourse';
import Dashboard from './pages/educator/Dashboard';
import Educator from './pages/educator/Educator';
import MyCCourse from './pages/educator/MyCCourse';
import StudentsEnrtolled from './pages/educator/StudentsEnrtolled';
import CourseDetails from './pages/student/COurseDetails';
import CoursesList from './pages/student/CoursesList';
import Home from './pages/student/Home';
import MyEnrollments from './pages/student/MyEnrollments';
import Player from './pages/student/Player';

const App = () => {
  const isEducatorRoute= useMatch('/educator/*')
  return (
    <div className='text-default min-h-screen bg-white'>
      {!isEducatorRoute &&<Navbar/>  }
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/course-list" element={<CoursesList />} />
      <Route path="/course-list/:input" element={<CoursesList />} />
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/my-enrollments" element={<MyEnrollments />} />
      <Route path="/player/:courseId" element={<Player />} />
      <Route path="/loading/:path" element={<Loading />} />
      <Route path='/educator' element={<Educator/>}>
      <Route path="/educator" element={<Dashboard />} />
      <Route path="add-course" element={<AddCourse />} />
      <Route path="my-courses" element={<MyCCourse />} />
      
      <Route path="student-enrolled" element={<StudentsEnrtolled />} />
      </Route>
    </Routes>
    </div>
  );
};

export default App;
