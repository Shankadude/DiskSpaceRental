import React from 'react';

const Sidebar = ({ activeRole, setRole }) => {
  return (
    <div className="w-48 bg-gray-900 text-white h-full p-4 space-y-4">
      <h2 className="text-lg font-semibold">Choose Role</h2>
      <button
        onClick={() => setRole('renter')}
        className={`block w-full text-left px-4 py-2 rounded hover:bg-gray-700 ${activeRole === 'renter' ? 'bg-gray-700' : ''}`}
      >
        Renter
      </button>
      <button
        onClick={() => setRole('provider')}
        className={`block w-full text-left px-4 py-2 rounded hover:bg-gray-700 ${activeRole === 'provider' ? 'bg-gray-700' : ''}`}
      >
        Provider
      </button>
    </div>
  );
};

export default Sidebar;
