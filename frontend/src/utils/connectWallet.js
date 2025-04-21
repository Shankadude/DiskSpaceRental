export const connectWallet = async () => {
    if (!window.ethereum) throw new Error("❌ MetaMask not found");
  
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  
    if (accounts.length > 0) return accounts[0]; // already connected
  
    // otherwise request permission
    const requested = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return requested[0];
  };
  