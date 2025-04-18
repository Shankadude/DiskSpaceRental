import React, { useState } from 'react';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid';

const FileUploader = ({ onUpload }) => {
  const [cid, setCid] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const helia = await createHelia();
      const fs = unixfs(helia);

      const fileContent = await file.arrayBuffer();
      const cidResult = await fs.addBytes(new Uint8Array(fileContent));

      const cidStr = cidResult.toString();
      setCid(cidStr);
      onUpload(cidStr);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload file to IPFS');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <input type="file" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      {cid && (
        <div className="mt-2 text-green-400">
          ✅ CID: <code>{cid}</code>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
