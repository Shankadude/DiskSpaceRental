import React, { useEffect, useState } from 'react';
import { createHeliaNode } from '../lib/heliaNode';
import { multiaddr } from '@multiformats/multiaddr';

export default function HeliaTest() {
  const [cid, setCid] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fs, setFs] = useState(null);
  const [libp2p, setLibp2p] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [connectedAddrs, setConnectedAddrs] = useState([]);
  const [multiaddrs, setMultiaddrs] = useState([]);
  const [peerId, setPeerId] = useState('');
  const [remoteAddr, setRemoteAddr] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        console.log('⚙️ Initializing Helia...');
        const { fs, helia } = await createHeliaNode();
        setFs(fs);
        const libp2p = helia.libp2p;
        setLibp2p(libp2p);
        window.libp2p = libp2p;
        window.multiaddr = multiaddr;
        if (typeof window !== 'undefined') {
            window.libp2p = libp2p;
            console.log('🌐 window.libp2p is now accessible in DevTools');
          }  
        console.log('🌐 libp2p exposed globally for DevTools');  
        setReady(true);
        console.log('✅ Helia node ready');

        const id = libp2p.peerId.toString();
        setPeerId(id);

        const addrs = libp2p.getMultiaddrs().map(ma => `${ma.toString()}/p2p/${id}`);
        setMultiaddrs(addrs);
        console.log('🌐 Your multiaddrs:', addrs);

        const updatePeers = () => {
          const peers = libp2p.getPeers();
          setPeerCount(peers.length);

          const conns = libp2p.getConnections();
          const addrs = conns.map(conn => conn.remoteAddr.toString());
          setConnectedAddrs(addrs);
          console.log('🔗 Connected peers:', addrs);
        };

        libp2p.addEventListener('peer:connect', updatePeers);
        libp2p.addEventListener('peer:disconnect', updatePeers);
        const interval = setInterval(updatePeers, 10000);
        return () => clearInterval(interval);
      } catch (err) {
        console.error('❌ Error initializing Helia:', err);
      }
    };

    init();
  }, []);

  const connectToPeer = async () => {
    if (!remoteAddr || !libp2p) return alert('Missing peer address or libp2p node');
    try {
      const parsed = multiaddr(remoteAddr);
      await libp2p.dial(parsed);
      console.log('🔌 Connected to peer:', remoteAddr);
    } catch (err) {
      console.error('❌ Failed to connect:', err);
      alert('❌ Failed to connect to peer. Check the address.');
    }
  };

  const addFile = async () => {
    const encoder = new TextEncoder();
    const content = encoder.encode('Hello from tab 1!');
    const fileCid = await fs.addBytes(content);
    setCid(fileCid.toString());
    console.log('📝 File added with CID:', fileCid.toString());
  };

  const getFile = async () => {
    if (!fs || !cid) return alert('CID or file system missing!');
    setLoading(true);
    try {
      let text = '';
      for await (const chunk of fs.cat(cid)) {
        text += new TextDecoder().decode(chunk);
      }
      setFileContent(text);
    } catch (err) {
      console.error('❌ Error retrieving file from CID:', err);
      setFileContent('❌ Failed to retrieve file from CID.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-center">🔁 Helia P2P File Test (Manual Connect)</h2>

      <p className="text-sm text-center text-gray-500">
        {ready ? `✅ Node Ready | Peer ID: ${peerId}` : '⏳ Initializing...'}
      </p>

      {ready && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Your Multiaddrs:</label>
            <textarea
              value={multiaddrs.length ? multiaddrs.join('\n') : '⚠️ None (Browser cannot listen on WebSocket)'}
              readOnly
              className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-700 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Connected To Peers:</label>
            <textarea
              value={connectedAddrs.join('\n') || 'No peers connected yet.'}
              readOnly
              className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-700 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Connect to Peer:</label>
            <input
              type="text"
              value={remoteAddr}
              onChange={(e) => setRemoteAddr(e.target.value)}
              placeholder="Paste peer multiaddr here"
              className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={connectToPeer}
              className="mt-2 w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
            >
              Connect to Peer
            </button>
          </div>

          <button
            onClick={addFile}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Add File (Hello from Tab 1)
          </button>

          <div>
            <label className="block text-sm font-medium mb-1">CID to Retrieve:</label>
            <input
              type="text"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              placeholder="Paste CID here"
              className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={getFile}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Retrieve File
          </button>

          {loading ? (
            <p className="text-center text-sm text-gray-400">Retrieving...</p>
          ) : (
            fileContent && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="font-semibold">Retrieved Content:</p>
                <pre className="break-words">{fileContent}</pre>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
