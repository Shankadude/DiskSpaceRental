import { encrypt } from '@metamask/eth-sig-util';
import { Buffer } from 'buffer';

export const encryptCID = async (cid, address) => {
  const publicKey = await window.ethereum.request({
    method: 'eth_getEncryptionPublicKey',
    params: [address],
  });

  const encrypted = encrypt({
    publicKey,
    data: cid,
    version: 'x25519-xsalsa20-poly1305',
  });

  return Buffer.from(JSON.stringify(encrypted), 'utf8').toString('base64');
};

export const decryptCID = async (base64) => {
  const encryptedData = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  return await window.ethereum.request({
    method: 'eth_decrypt',
    params: [JSON.stringify(encryptedData), window.ethereum.selectedAddress],
  });
};
