import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig';

export async function getContract() {
  if (!window.ethereum) throw new Error("❌ No wallet found. Please install MetaMask.");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  if (!CONTRACT_ABI || !Array.isArray(CONTRACT_ABI)) {
    throw new Error("❌ ABI not loaded or not an array.");
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  return contract;
}
