import React, { useState } from 'react';
import { getContract } from '../utils/getContract';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { BrowserProvider } from 'ethers';

const ProfileForm = () => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarCID, setAvatarCID] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const helia = await createHelia();
      const fs = unixfs(helia);
      const fileBytes = await file.arrayBuffer();
      const cid = await fs.addBytes(new Uint8Array(fileBytes));

      setAvatarCID(cid.toString());
      alert('Image uploaded! CID: ' + cid.toString());
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Upload failed. See console for details.');
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);

    try {
      if (!window.ethereum) return alert("Please install MetaMask");

      const provider = new BrowserProvider(window.ethereum);
      const contract = await getContract(); // getContract uses latest signer

      const profileJSON = JSON.stringify({
        displayName,
        bio,
        avatarCID,
      });

      console.log("Saving profile:", profileJSON);

      console.log("Contract instance:", contract);
      console.log("Calling updateEncryptedProfile with:", profileJSON);
      
      const tx = await contract.updateEncryptedProfile(profileJSON);
      console.log("Tx object:", tx);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      alert("Profile updated!");
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Transaction failed. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-10 p-4 bg-gray-700 rounded">
      <h3 className="text-lg font-bold mb-2">Your Profile</h3>

      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="p-2 mb-2 w-full text-black rounded"
      />

      <input
        type="text"
        placeholder="Avatar CID"
        value={avatarCID}
        readOnly
        className="p-2 mb-2 w-full text-black rounded"
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="p-2 mb-2 w-full text-white"
      />

      <textarea
        placeholder="Your bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="p-2 mb-2 w-full text-black rounded"
      />

      <button
        onClick={saveProfile}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={uploading || saving}
      >
        {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
};

export default ProfileForm;
