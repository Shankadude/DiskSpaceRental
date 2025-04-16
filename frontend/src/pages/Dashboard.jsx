import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/getContract';
import { BrowserProvider } from 'ethers';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [wallet, setWallet] = useState('');
  const [role, setRole] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [listings, setListings] = useState([]);
  const [balance, setBalance] = useState('0');
  const [rating, setRating] = useState('0.00');

  useEffect(() => {
    const load = async () => {
      try {
        if (!window.ethereum) return alert("Please install MetaMask.");
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWallet(address);

        const contract = await getContract();

        const r = await contract.rentals(address);
        const l = await contract.storageProviders(address);

        setRentals(r);
        setListings(l);

        if (r.length > 0 && l.length > 0) setRole('both');
        else if (r.length > 0) setRole('renter');
        else if (l.length > 0) setRole('provider');

        const bal = await contract.providerBalances(address);
        const ratingSum = await contract.providerRatings(address);
        const totalReviews = await contract.totalReviews(address);

        const avgRating =
          totalReviews > 0
            ? (Number(ratingSum) / Number(totalReviews)).toFixed(2)
            : '0.00';

        setBalance((Number(bal) / 1e18).toFixed(4));
        setRating(avgRating);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-2">📊 Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-gray-600 dark:text-gray-300">👤 Wallet</p>
          <p className="font-mono text-sm mt-1 text-indigo-500">{wallet}</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-gray-600 dark:text-gray-300">🧑‍💼 Role</p>
          <p className="text-lg font-semibold mt-1 capitalize">
            {role || 'Undetected'}
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-gray-600 dark:text-gray-300">📦 Listings</p>
          <p className="text-lg font-semibold mt-1">{listings.length}</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-gray-600 dark:text-gray-300">📁 Rentals</p>
          <p className="text-lg font-semibold mt-1">{rentals.length}</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-gray-600 dark:text-gray-300">💰 Earnings</p>
          <p className="text-lg font-semibold mt-1">{balance} ETH</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-gray-600 dark:text-gray-300">⭐ Avg. Rating</p>
          <p className="text-lg font-semibold mt-1">{rating} / 5</p>
        </div>
      </div>

      {/* Role-based quick links */}
      {role === 'renter' && (
        <Link to="/renter" className="inline-block mt-4 text-indigo-400 underline">
          ➡ Go to Renter Dashboard
        </Link>
      )}
      {role === 'provider' && (
        <Link to="/provider" className="inline-block mt-4 text-indigo-400 underline">
          ➡ Go to Provider Dashboard
        </Link>
      )}
    </div>
  );
};

export default Dashboard;
