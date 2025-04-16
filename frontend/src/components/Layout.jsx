import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ProviderView from '../pages/ProviderView';
import RenterView from '../pages/RenterView';

const Layout = () => {
  const [role, setRole] = useState('renter');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar activeRole={role} setRole={setRole} />
        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
          {role === 'renter' ? <RenterView /> : <ProviderView />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
