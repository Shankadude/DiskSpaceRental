import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/getContract';
import ProfileForm from '../components/ProfileForm';
import { ethers } from "ethers";

const ProviderView = () => {
  const [rating, setRating] = useState('0.00');
  const [contract, setContract] = useState(null);
  const [sizeInGB, setSizeInGB] = useState('');
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const load = async () => {
      const c = await getContract();
      setContract(c);
      fetchListings(c);
  
      // 👇 Rating logic
      try {
        const signer = await c.signer.getAddress();
        const ratingSum = await c.providerRatings(signer);
        const totalReviews = await c.totalReviews(signer);
        const avg = totalReviews > 0
          ? (Number(ratingSum) / Number(totalReviews)).toFixed(2)
          : '0.00';
        setRating(avg);
      } catch (err) {
        console.error("Rating fetch failed:", err);
      }
    };
  
    load();
  }, []);
  

  const fetchListings = async (contractInstance) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
  
    const myListings = await contractInstance.getMyListings(address); // ✅ This works!
    setListings(myListings);
  };
  

  const listStorage = async () => {
    if (!sizeInGB || isNaN(sizeInGB)) return;
    try {
      const tx = await contract.listStorage(Number(sizeInGB));
      await tx.wait();
      alert("Storage listed!");
      fetchListings(contract);
    } catch (err) {
      console.error("Listing failed:", err);
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
        <button
          onClick={listStorage}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          List
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Your Listings</h3>
      <ul className="space-y-2">
  {listings.map((s, i) => (
    <li key={i} className="bg-gray-700 p-3 rounded shadow text-sm flex justify-between items-center">
      <div>
        <strong>Price/Day:</strong> {Number(s.pricePerDay) / 1e18} ETH |{" "}
        <strong>Size:</strong> {s.sizeInGB} GB |{" "}
        <strong>Status:</strong>{" "}
        {s.isAvailable ? (
          <span className="text-green-400">Available</span>
        ) : (
          <span className="text-red-400">Rented</span>
        )}
      </div>
      {s.isAvailable && (
        <button
          onClick={async () => {
            try {
              const tx = await contract.unlistStorage(i);
              await tx.wait();
              alert("Unlisted!");
              fetchListings(contract);
            } catch (err) {
              console.error("Unlisting failed:", err);
            }
          }}
          className="bg-red-600 text-white px-3 py-1 rounded ml-4"
        >
          Unlist
        </button>
      )}
    </li>
  ))}
</ul>


      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-2">Withdraw Earnings</h3>
        <button
          onClick={async () => {
            try {
              const tx = await contract.withdrawFunds();
              await tx.wait();
              alert("Funds withdrawn!");
            } catch (err) {
              console.error("Withdraw failed:", err);
            }
          }}
          className="bg-yellow-500 text-black px-4 py-2 rounded"
        >
          Withdraw to Wallet
        </button>
      </div>
    </div>
  );
};

export default ProviderView;
