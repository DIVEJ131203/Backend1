import { UserButton, useUser } from '@clerk/clerk-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Navbar = () => {
    const { user } = useUser();

    return (
        <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3">
            <Link to="/">
                <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
            </Link>
            <div className="flex items-center gap-5 text-gray-500 relative">
                <p>
                    Hi! {user ? user.fullName : "Guest"}
                </p>
                {user ? (
                    <UserButton afterSignOutUrl="/" />
                ) : (
                    <img src={assets.profile_img} alt="Profile" className="w-10 h-10 rounded-full" />
                )}
            </div>
        </div>
    );
};

export default Navbar;
