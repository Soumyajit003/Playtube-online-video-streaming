import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 md:ml-64 min-h-[calc(100vh-64px)] overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
