import React, { useEffect, useState, useCallback } from 'react';
import { getContract } from '../utils/getContract';
import ProfileForm from '../components/ProfileForm';
import { ethers } from 'ethers';

const ProviderView = () => {
  const [rating, setRating] = useState('0.00');
  const [contract, setContract] = useState(null);
  const [sizeInGB, setSizeInGB] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchListings = useCallback(async (cInstance) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const myListings = await cInstance.getMyListings(address);
      setListings(myListings);
    } catch (err) {
      console.error('Fetching listings failed:', err);
      setListings([]);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const c = await getContract();
        setContract(c);
        window.contract = c;
        window.ethers = ethers;
        console.log("✅ Contract exposed globally:", c.target);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();

        console.log("🧠 Sanity Check:");
        console.log("Signer Address:", address);
        console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
        console.log("Connected Contract:", c.target);

        await fetchListings(c);

        const ratingSum = await c.providerRatings(address);
        const totalReviews = await c.totalReviews(address);
        const avg =
          totalReviews > 0
            ? (Number(ratingSum) / Number(totalReviews)).toFixed(2)
            : '0.00';
        setRating(avg);
      } catch (err) {
        console.error('Initialization failed:', err);
      }
    };

    load();
  }, [fetchListings]);

  const listStorage = async () => {
    const parsedSize = Number(sizeInGB);
    let parsedPrice;

    try {
      parsedPrice = ethers.parseEther(pricePerDay);
    } catch (err) {
      alert("Invalid price input. Please enter a valid ETH value.");
      return;
    }

    console.log("Parsed price (wei):", parsedPrice.toString());
    console.log("Parsed size:", parsedSize);

    if (parsedSize <= 0 || parsedPrice <= 0n) {
      alert("Please enter valid non-zero size and price");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.listStorage(parsedPrice, parsedSize);
      console.log("📤 Transaction sent:", tx.hash);
      await tx.wait();
      alert("✅ Storage listed successfully!");
      await fetchListings(contract);
      setSizeInGB('');
      setPricePerDay('');
    } catch (err) {
      console.error("❌ Listing failed:", err);
      alert("❌ Listing failed: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUnlist = async (index) => {
    try {
      setLoading(true);
      const tx = await contract.unlistStorage(index);
      await tx.wait();
      alert('Unlisted!');
      await fetchListings(contract);
    } catch (err) {
      console.error('Unlisting failed:', err);
      alert('Failed to unlist.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true);
      const tx = await contract.withdrawFunds();
      await tx.wait();
      alert('Funds withdrawn!');
    } catch (err) {
      console.error('Withdraw failed:', err);
      alert('Failed to withdraw.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div>
      <ProfileForm />

      <p className="text-lg mt-2">
        ⭐ Average Rating: <span className="font-semibold">{rating}</span> / 5
      </p>

      <h2 className="text-2xl font-bold mb-4">List Your Storage</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={sizeInGB}
          onChange={(e) => setSizeInGB(e.target.value)}
          placeholder="Size in GB"
          className="p-2 text-black rounded"
        />
        <input
          type="number"
          value={pricePerDay}
          onChange={(e) => setPricePerDay(e.target.value)}
          placeholder="Price per day in ETH"
          className="p-2 text-black rounded"
        />
        <button
          onClick={listStorage}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Listing...' : 'List'}
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Your Listings</h3>
      <ul className="space-y-2">
        {listings.map((s, i) => (
          <li
            key={i}
            className="bg-gray-700 p-3 rounded shadow text-sm flex justify-between items-center"
          >
            <div>
              <strong>Price/Day:</strong> {Number(s.pricePerDay) / 1e18} ETH |{' '}
              <strong>Size:</strong> {s.sizeInGB} GB |{' '}
              <strong>Status:</strong>{' '}
              {s.isAvailable ? (
                <span className="text-green-400">Available</span>
              ) : (
                <span className="text-red-400">Rented</span>
              )}
            </div>
            {s.isAvailable && (
              <button
                onClick={() => handleUnlist(i)}
                className="bg-red-600 text-white px-3 py-1 rounded ml-4"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Unlist'}
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-2">Withdraw Earnings</h3>
        <button
          onClick={handleWithdraw}
          className="bg-yellow-500 text-black px-4 py-2 rounded"
          disabled={withdrawing}
        >
          {withdrawing ? 'Withdrawing...' : 'Withdraw to Wallet'}
        </button>
      </div>
    </div>
  );
};

export default ProviderView;
