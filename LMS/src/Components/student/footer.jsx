import React, { useState } from 'react';
import { assets } from '../../assets/assets';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setMessage('Please enter a valid email address.');
      return;
    }
    setMessage('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
          
          {/* Logo & About */}
          <div className="flex flex-col items-center md:items-start">
            <img src={assets.logo_dark} alt="Edemy Logo" className="w-32 mb-4" />
            <p className="text-sm text-gray-500 max-w-xs">
              Empowering learners worldwide with high-quality education, anytime, anywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <a href="/about" className="hover:text-white transition">About Us</a>
            <a href="/courses" className="hover:text-white transition">Courses</a>
            <a href="/blog" className="hover:text-white transition">Blog</a>
            <a href="/contact" className="hover:text-white transition">Contact</a>
          </div>

          {/* Support & Policies */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <a href="/faq" className="hover:text-white transition">FAQs</a>
            <a href="/terms" className="hover:text-white transition">Terms of Service</a>
            <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
            <a href="/help" className="hover:text-white transition">Help Center</a>
          </div>

          {/* Newsletter Subscription */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-white mb-3">Subscribe to Our Newsletter</h3>
            <p className="text-sm text-gray-500 mb-3">Stay updated with the latest courses and offers.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col w-full max-w-xs">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="w-full p-2 bg-gray-800 text-white rounded-md focus:outline-none"
                required
              />
              <button type="submit" className="mt-3 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                Subscribe
              </button>
            </form>
            {message && <p className="text-sm mt-2 text-green-400">{message}</p>}
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          <p>Copyright © 2025 Divej Ahuja. All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
