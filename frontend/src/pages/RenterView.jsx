import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/getContract';
import { ethers } from 'ethers';
import FileUploader from '../components/FileUploader';

const RenterView = () => {
  const [availableStorage, setAvailableStorage] = useState([]);
  const [cid, setCid] = useState('');
  const [rentalDays, setRentalDays] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);

  const fetchContract = async () => {
    try {
      const c = await getContract();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const allListings = await c.getMyListings(address); // Provider's listings
      const available = allListings.filter((s) => s.isAvailable);
      setAvailableStorage(available);
      setContract(c);
    } catch (err) {
      console.error('Error fetching storage:', err);
    }
  };

  useEffect(() => {
    fetchContract();
  }, []);

  const handleRent = async () => {
    if (selectedIndex === null || !cid || rentalDays <= 0) {
      alert('Please select a listing and provide CID & rental days');
      return;
    }

    try {
      setLoading(true);

      const storage = availableStorage[selectedIndex];
      const totalCost = ethers.toBigInt(storage.pricePerDay) * ethers.toBigInt(rentalDays);

      const tx = await contract.rentStorage(
        storage.provider,
        selectedIndex,
        rentalDays,
        cid,
        { value: totalCost }
      );

      console.log('📤 Rent TX:', tx.hash);
      await tx.wait();

      alert('✅ Rented successfully!');
      setCid('');
      setRentalDays(1);
    } catch (err) {
      console.error('Rent failed:', err);
      alert('❌ Rent failed: ' + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Rent Storage</h2>

      <ul className="space-y-2 mb-4">
        {availableStorage.length === 0 ? (
          <p className="text-yellow-300">No available storage listings at the moment.</p>
        ) : (
          availableStorage.map((s, i) => (
            <li
              key={i}
              className={`p-3 rounded cursor-pointer border ${
                selectedIndex === i ? 'bg-blue-600' : 'bg-gray-700'
              }`}
              onClick={() => setSelectedIndex(i)}
            >
              <strong>Provider:</strong> {s.provider}<br />
              <strong>Price:</strong> {Number(s.pricePerDay) / 1e18} ETH/day<br />
              <strong>Size:</strong> {s.sizeInGB} GB<br />
              <strong>Status:</strong>{' '}
              {s.isAvailable ? (
                <span className="text-green-400">Available</span>
              ) : (
                <span className="text-red-400">Unavailable</span>
              )}
            </li>
          ))
        )}
      </ul>

      <div className="flex flex-col gap-2 mb-4">
        <FileUploader onUpload={(newCid) => setCid(newCid)} />
        <input
          type="text"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder="Or paste CID manually"
          className="p-2 rounded text-black"
        />
        <input
          type="number"
          value={rentalDays}
          onChange={(e) => setRentalDays(e.target.value)}
          placeholder="Days to rent"
          className="p-2 rounded text-black"
          min="1"
        />
        <button
          onClick={handleRent}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Renting...' : 'Rent Storage'}
        </button>
      </div>
    </div>
  );
};

export default RenterView;
