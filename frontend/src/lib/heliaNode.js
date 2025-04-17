import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { kadDHT } from '@libp2p/kad-dht';
import { identify } from '@libp2p/identify';
import { ping } from '@libp2p/ping';

export async function createHeliaNode() {
  const libp2p = await createLibp2p({
    transports: [webSockets()],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    services: {
      identify: identify(),
      ping: ping(),
      dht: kadDHT()
    }
  });

  const helia = await createHelia({ libp2p });
  const fs = unixfs(helia);

  return { helia, fs };
}
