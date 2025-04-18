import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/getContract';
import { ethers } from 'ethers';

const RenterRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = await getContract();

      const result = await contract.getMyRentals(address);
      setRentals(result);
    } catch (err) {
      console.error('Error fetching rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Rentals</h2>
      {loading ? (
        <p>Loading...</p>
      ) : rentals.length === 0 ? (
        <p>No active rentals found.</p>
      ) : (
        <ul className="space-y-3">
          {rentals.map((r, i) => (
            <li key={i} className="bg-gray-800 p-3 rounded shadow text-sm">
              <div><strong>Provider:</strong> {r.provider}</div>
              <div><strong>Storage ID:</strong> {r.storageId}</div>
              <div><strong>End Time:</strong> {new Date(Number(r.endTime) * 1000).toLocaleString()}</div>
              <div><strong>Escrow:</strong> {Number(r.escrowAmount) / 1e18} ETH</div>
              <div><strong>CID:</strong> {r.cid || 'Not set yet'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RenterRentals;
