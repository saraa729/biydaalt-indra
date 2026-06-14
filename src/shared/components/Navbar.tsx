import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">
          <Link to="/">BieDaalt</Link>
        </div>
        <div className="flex gap-6">
          <Link to="/admissions" className="text-white hover:text-blue-200 transition">Admissions</Link>
          <Link to="/announcements" className="text-white hover:text-blue-200 transition">Announcements</Link>
          <Link to="/news" className="text-white hover:text-blue-200 transition">News</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
