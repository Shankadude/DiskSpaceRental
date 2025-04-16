import React from 'react';
import { API_BASE } from '../utils/api';
import axios from 'axios';

const ReceiptLogger = ({ user, provider, storageId, duration, cid }) => {
  const saveReceipt = async () => {
    try {
      const metadata = { user, provider, storageId, duration, cid };
      const res = await axios.post(`${API_BASE}/generate-metadata`, metadata);
      console.log("📦 Receipt saved:", res.data);
    } catch (err) {
      console.error("❌ Error saving receipt:", err);
    }
  };

  return (
    <button
      onClick={saveReceipt}
      className="bg-blue-600 text-white px-3 py-1 rounded mt-2"
    >
      Save Metadata to Backend
    </button>
  );
};

export default ReceiptLogger;
