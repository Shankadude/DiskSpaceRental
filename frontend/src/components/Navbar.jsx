import React, { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Detect wallet and handle account switch
  useEffect(() => {
    const detectWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) setWalletAddress(accounts[0]);
      }
    };

    detectWallet();

    window.ethereum?.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress('');
      }
    });
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    try {
      const current = await window.ethereum.request({ method: 'eth_accounts' });
      if (current.length > 0) {
        setWalletAddress(current[0]);
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) setWalletAddress(accounts[0]);
    } catch (err) {
      console.error("Wallet connect failed:", err);
      alert(err.message);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 text-black dark:text-white px-6 py-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">DiskSpaceRental</h1>
        <Link to="/" className="hover:text-indigo-400">Dashboard</Link>
        <Link to="/renter" className="hover:text-indigo-400">Renter</Link>
        <Link to="/provider" className="hover:text-indigo-400">Provider</Link>
        <Link
          to="/heliatest"
          className="mr-4 hover:underline hover:text-blue-400 transition-colors"
        >
          Peer Sync
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="hover:text-yellow-500 transition-colors"
          title="Toggle dark mode"
        >
          {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>

        {walletAddress ? (
          <>
            <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            <button
              onClick={disconnectWallet}
              className="bg-red-500 hover:bg-red-400 px-3 py-1 text-sm rounded"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1 text-sm rounded"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
