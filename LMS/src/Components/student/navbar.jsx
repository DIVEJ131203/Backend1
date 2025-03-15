import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../Context/AppContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isCourseListPage = location.pathname.includes('/course-list');

  const { isEducator } = useContext(AppContext);

  const { openSignIn } = useClerk();
  const { user, isSignedIn } = useUser();

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
      
      {/* Logo - Clickable to navigate home */}
      <img 
        onClick={() => navigate('/')} 
        src={assets.logo} 
        alt="Logo" 
        className="w-28 lg:w-32 cursor-pointer" 
      />

      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-6 text-gray-500">
        {isSignedIn && (
          <>
            {isEducator ? (
              <Link to="/educator" className="text-green-600 hover:underline">
                Educator Dashboard
              </Link>
            ) : (
              <button 
                className="hover:text-gray-700" 
                onClick={() => navigate('/become-educator')}
              >
                Become an Educator
              </button>
            )}

            <Link to="/my-enrollments" className="text-blue-500 hover:underline">My Enrollments</Link>
          </>
        )}

        {!isSignedIn ? (
          <button 
            className="bg-blue-600 text-white px-5 py-2 rounded-full" 
            onClick={() => openSignIn()}
          >
            Create Account
          </button>
        ) : (
          <UserButton />
        )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex items-center gap-4 text-gray-500">
        {isSignedIn && (
          <div className="flex gap-4">
            {isEducator ? (
              <Link to="/educator/educator" className="text-green-600 hover:underline">
                Educator Dashboard
              </Link>
            ) : (
              <button className="hover:text-gray-700" onClick={() => navigate('/become-educator')}>
                Become Educator
              </button>
            )}

            <Link to="/my-enrollments" className="text-blue-500 hover:underline">My Enrollments</Link>
          </div>
        )}

        {isSignedIn ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()} className="p-2">
            <img src={assets.user_icon} alt="User Icon" className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
