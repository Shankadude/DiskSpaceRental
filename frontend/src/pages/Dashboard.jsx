import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/getContract';
import { ethers } from 'ethers';
import { decryptCID } from '../utils/encryption';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';

const RoleSelector = ({ currentRole, onChange }) => {
  return (
    <div className="mb-4">
      <label className="mr-2 font-medium">Select Role:</label>
      <select
        value={currentRole}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1 rounded border dark:bg-gray-700 dark:text-white"
      >
        <option value="Provider">Provider</option>
        <option value="Renter">Renter</option>
      </select>
    </div>
  );
};

const Dashboard = () => {
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || null);
  const [rentals, setRentals] = useState([]);
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = await getContract();

      const myListings = await contract.getMyListings(address);
      if (!localStorage.getItem('userRole')) {
        if (myListings.length > 0) {
          setRole('Provider');
          localStorage.setItem('userRole', 'Provider');
        } else {
          setRole('Renter');
          localStorage.setItem('userRole', 'Renter');
        }
      }

      if (myListings.length > 0) {
        const b = await contract.providerBalances(address);
        setBalance(ethers.formatEther(b));
      } else {
        const r = await contract.getMyRentals(address);
        setRentals(r);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  const downloadFile = async (encryptedCid) => {
    try {
      const cid = await decryptCID(encryptedCid);
      const helia = await createHelia();
      const fs = unixfs(helia);

      const stream = fs.cat(cid);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cid}.bin`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download file: " + err.message);
    }
  };

  if (loading) return <p>Loading Dashboard...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
      <RoleSelector currentRole={role} onChange={handleRoleChange} />

      {role === 'Provider' ? (
        <>
          <p className="mb-2">👤 Role: <strong>Provider</strong></p>
          <p>💰 Balance: <strong>{balance} ETH</strong></p>
        </>
      ) : (
        <>
          <p className="mb-2">👤 Role: <strong>Renter</strong></p>
          <h3 className="text-lg font-semibold mt-4">Your Rentals</h3>
          <ul className="space-y-2 mt-2">
            {rentals.map((r, i) => (
              <li key={i} className="bg-gray-800 p-3 rounded text-sm">
                <div><strong>Provider:</strong> {r.provider}</div>
                <div><strong>Storage ID:</strong> {r.storageId}</div>
                <div><strong>Ends:</strong> {new Date(Number(r.endTime) * 1000).toLocaleString()}</div>
                <div>
                  <strong>CID:</strong> {r.cid ? (
                    <>
                      <span className="text-green-400">Encrypted</span>
                      <button
                        onClick={() => downloadFile(r.cid)}
                        className="ml-4 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Download File
                      </button>
                    </>
                  ) : (
                    <span className="text-yellow-300">Not Uploaded</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Dashboard;
