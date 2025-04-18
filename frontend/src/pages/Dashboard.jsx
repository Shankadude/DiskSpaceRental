import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/getContract';
import { ethers } from 'ethers';

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = await getContract();

      // Basic Role Logic
      const myListings = await contract.getMyListings(address);
      if (myListings.length > 0) {
        setRole('Provider');
        const b = await contract.providerBalances(address);
        setBalance(ethers.formatEther(b));
      } else {
        setRole('Renter');
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

  if (loading) return <p>Loading Dashboard...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
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
                <div><strong>CID:</strong> {r.cid || 'Not Uploaded'}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Dashboard;
