import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../Context/AppContext';

const Sidebar = () => {
    const { isEducator } = useContext(AppContext);

    const menuItems = [
        { name: 'Dashboard', path: "/educator", icon: assets.home_icon },
        { name: 'Add Course', path: "/educator/add-course", icon: assets.add_icon },
        { name: 'My Courses', path: "/educator/my-courses", icon: assets.my_course_icon },
        { name: 'Students Enrolled', path: "/educator/student-enrolled", icon: assets.person_tick_icon }
    ];

    return isEducator ? (
        <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col bg-gray-50">
            {menuItems.map((item, index) => (
                <NavLink 
                    key={index} 
                    to={item.path} 
                    end={item.path === "/educator"} // Fix for Dashboard
                    className={({ isActive }) => 
                        `flex items-center gap-3 p-2 rounded-md transition-all duration-200 
                        ${isActive ? "bg-purple-100 text-purple-800 font-medium border-r-[6px] border-indigo-500/90 hover:border-gray-100/90" : "text-gray-700 hover:bg-purple-50"}`
                    }
                >
                    <img src={item.icon} alt={item.name} className="w-6 h-6" />
                    <p className="md:block hidden">{item.name}</p>
                </NavLink>
            ))}
        </div>
    ) : null;
};

export default Sidebar;
