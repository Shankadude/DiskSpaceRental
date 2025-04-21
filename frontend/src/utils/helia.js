import { createHelia } from 'helia'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { createLibp2p } from 'libp2p'
import { unixfs } from '@helia/unixfs'

export const createHeliaNode = async () => {
  const libp2p = await createLibp2p({
    transports: [webSockets(), circuitRelayTransport()],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    services: {
      identify: identify()
      // ✅ removed relay: circuitRelayClient()
    }
  })

  const helia = await createHelia({ libp2p })
  const fs = unixfs(helia)

  return { helia, fs, libp2p }
}
