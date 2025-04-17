import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { identify } from '@libp2p/identify'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'

const main = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/15002/ws'] // listen on all interfaces
    },
    transports: [webSockets()],
    connectionEncryption: [noise()], // 🔐 IMPORTANT
    streamMuxers: [mplex()],
    services: {
      identify: identify(),             // 👤 Required for browser
      relay: circuitRelayServer()       // 🔁 Enable relay service
    }
  })

  await node.start()

  console.log('🚀 Relay node started!')
  console.log('🆔 Peer ID:', node.peerId.toString())
  node.getMultiaddrs().forEach(addr => {
    console.log('📡 Listening on:', addr.toString())
  })
}

main()
