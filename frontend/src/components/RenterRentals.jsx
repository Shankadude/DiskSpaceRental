import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/getContract';
import { ethers } from 'ethers';

const RenterRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [contract, setContract] = useState(null);
  const [cidInputs, setCidInputs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const c = await getContract();
      setContract(c);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      try {
        const result = await c.rentals(address); // ✅ access public mapping
        setRentals(result);
        setCidInputs(result.map(r => r.cid));
      } catch (err) {
        console.error("Error fetching rentals:", err);
      }
    };

    load();
  }, []);

  const updateCID = async (index) => {
    if (!cidInputs[index]) return;
    try {
      await contract.updateCID(index, cidInputs[index]);
      alert('CID updated!');
    } catch (err) {
      console.error("CID update failed:", err);
    }
  };

  const requestRefund = async (index) => {
    try {
      await contract.requestRefund(index);
      alert('Refund requested!');
    } catch (err) {
      console.error("Refund failed:", err);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">My Active Rentals</h2>
      {rentals.length === 0 && <p>No rentals found.</p>}
      <div className="grid gap-4">
        {rentals.map((r, i) => (
          <div key={i} className="p-4 bg-gray-700 rounded shadow">
            <p><strong>Provider:</strong> {r.provider}</p>
            <p><strong>Storage ID:</strong> {Number(r.storageId)}</p>
            <p><strong>End Time:</strong> {new Date(Number(r.endTime) * 1000).toLocaleString()}</p>
            <p><strong>Current CID:</strong> {r.cid}</p>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={cidInputs[i]}
                onChange={(e) => {
                  const updated = [...cidInputs];
                  updated[i] = e.target.value;
                  setCidInputs(updated);
                }}
                className="p-1 text-black rounded"
              />
              <button onClick={() => updateCID(i)} className="bg-blue-500 text-white px-2 py-1 rounded">
                Update CID
              </button>
              <button onClick={() => requestRefund(i)} className="bg-red-500 text-white px-2 py-1 rounded">
                Refund
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RenterRentals;
