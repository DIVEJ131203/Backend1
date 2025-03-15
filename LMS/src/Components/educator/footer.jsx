import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <footer className='flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 border-t py-4 bg-gray-50'>
      {/* Left Side */}
      <div className='flex flex-col md:flex-row items-center gap-4'>
        <img src={assets.logo} alt="Logo" className='w-24' />
        <div className='hidden md:block h-7 w-px bg-gray-500/60'></div>
        <p className='text-xs md:text-sm text-gray-500'>
          Copyright © 2025 Divej Ahuja. All Rights Reserved.
        </p>
      </div>

      {/* Right Side */}
      <div className='flex flex-col md:flex-row items-center gap-4 text-gray-600 text-sm'>
        <Link to="/about" className='hover:text-gray-900 transition'>About Us</Link>
        <Link to="/contact" className='hover:text-gray-900 transition'>Contact</Link>
        <Link to="/privacy-policy" className='hover:text-gray-900 transition'>Privacy Policy</Link>
        <Link to="/terms" className='hover:text-gray-900 transition'>Terms of Service</Link>
      </div>
    </footer>
  );
};

export default Footer;

