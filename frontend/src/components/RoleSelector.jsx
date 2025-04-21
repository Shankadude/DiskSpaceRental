import React, { useEffect, useState } from 'react';

const RoleSelector = ({ onChange }) => {
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || 'renter');

  useEffect(() => {
    localStorage.setItem('userRole', role);
    onChange(role); // notify parent
  }, [role, onChange]);

  return (
    <div className="flex gap-4 items-center">
      <label className="font-semibold text-sm">Role:</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border px-2 py-1 rounded dark:bg-gray-800 dark:text-white"
      >
        <option value="renter">Renter</option>
        <option value="provider">Provider</option>
      </select>
    </div>
  );
};

export default RoleSelector;
