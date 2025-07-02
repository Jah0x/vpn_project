import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../../Layout/Navbar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="pt-16 max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Админка</h1>
        <nav className="mb-4 space-x-4">
          <NavLink
            to="/admin/plans"
            className={({ isActive }) =>
              `hover:underline ${isActive ? 'text-blue-400' : 'text-white'}`
            }
          >
            Тарифы
          </NavLink>
        </nav>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
