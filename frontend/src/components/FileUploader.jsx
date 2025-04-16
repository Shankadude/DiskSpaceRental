import React, { useState } from 'react';
import { API_BASE } from '../utils/api';
import axios from 'axios';

const FileUploader = ({ onUpload }) => {
  const [status, setStatus] = useState('');

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('Uploading...');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`${API_BASE}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus('Upload complete!');
      onUpload(res.data); // { cid, url }
    } catch (err) {
      console.error(err);
      setStatus('Upload failed');
    }
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <p>{status}</p>
    </div>
  );
};

export default FileUploader;
