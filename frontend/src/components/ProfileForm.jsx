import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/getContract';

const ProfileForm = () => {
  const [contract, setContract] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarCID, setAvatarCID] = useState('');

  useEffect(() => {
    const init = async () => {
      const c = await getContract();
      setContract(c);
    };
    init();
  }, []);

  const saveProfile = async () => {
    const profileJSON = JSON.stringify({
      displayName,
      bio,
      avatarCID
    });
    try {
      const tx = await contract.updateEncryptedProfile(profileJSON);
      await tx.wait();
      alert("Profile updated!");
    } catch (err) {
      console.error("Profile update failed:", err);
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
        onChange={(e) => setAvatarCID(e.target.value)}
        className="p-2 mb-2 w-full text-black rounded"
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
      >
        Save Profile
      </button>
    </div>
  );
};

export default ProfileForm;
