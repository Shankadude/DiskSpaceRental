import React, { useEffect, useState } from 'react';
import { API_BASE } from '../utils/api';
import axios from 'axios';

const ReceiptHistory = ({ userAddress }) => {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    if (!userAddress) return;
    const load = async () => {
      const res = await axios.get(`${API_BASE}/receipts/${userAddress}`);
      setReceipts(res.data);
    };
    load();
  }, [userAddress]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">Your Receipts</h3>
      <ul className="space-y-2">
        {receipts.map((r, i) => (
          <li key={i} className="bg-gray-700 p-3 rounded text-sm">
            <strong>CID:</strong> {r.cid}<br />
            <strong>Storage ID:</strong> {r.storageId} |{" "}
            <strong>Duration:</strong> {r.duration}<br />
            <strong>IPFS:</strong>{" "}
            <a href={`https://ipfs.io/ipfs/${r.cid}`} className="underline text-blue-300" target="_blank" rel="noreferrer">
              View Metadata
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReceiptHistory;
