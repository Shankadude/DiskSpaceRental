/* global BigInt */
import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/getContract';
import RenterRentals from '../components/RenterRentals';
import FileUploader from '../components/FileUploader';
import ReceiptLogger from '../components/ReceiptLogger';
import ReceiptHistory from '../components/ReceiptHistory';

const RenterView = () => {
  const [storageList, setStorageList] = useState([]);
  const [contract, setContract] = useState(null);
  const [rentalDays, setRentalDays] = useState(1);
  const [selected, setSelected] = useState(null);
  const [cid, setCid] = useState("");
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    const fetchContract = async () => {
      const c = await getContract();
      setContract(c);

      try {
        const signer = await c.signer.getAddress();
        setUserAddress(signer);

        const providers = await c.getAllStorage();
        setStorageList(providers);
      } catch (err) {
        console.error("Error fetching storage:", err);
      }
    };

    fetchContract();
  }, []);

  const rentStorage = async () => {
    if (selected === null || !rentalDays || !cid || !contract) return;

    const selectedStorage = storageList[selected];
    const cost = BigInt(selectedStorage.pricePerDay.toString()) * BigInt(rentalDays.toString());

    try {
      await contract.rentStorage(
        selectedStorage.provider,
        selected,
        rentalDays,
        cid,
        { value: cost }
      );
      alert("Storage rented successfully!");
    } catch (err) {
      console.error("Rent failed:", err);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Available Storage</h2>

      <FileUploader onUpload={({ cid }) => setCid(cid)} />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black rounded">
          <thead>
            <tr>
              <th className="p-2">Provider</th>
              <th>Price/Day</th>
              <th>Size (GB)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {storageList.map((s, i) => (
              <tr key={i}>
                <td className="p-2">{s.provider}</td>
                <td>{Number(s.pricePerDay) / 1e18} ETH</td>
                <td>{s.sizeInGB}</td>
                <td>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => setSelected(i)}
                  >
                    Rent
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected !== null && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <h3 className="text-lg mb-2">Rent Selected Storage</h3>
          <input
            type="number"
            value={rentalDays}
            onChange={(e) => setRentalDays(e.target.value)}
            placeholder="Rental days"
            className="p-2 rounded mr-2 text-black"
          />
          <input
            type="text"
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            placeholder="Enter CID (IPFS)"
            className="p-2 rounded mr-2 text-black"
          />
          <button
            onClick={rentStorage}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Confirm Rent
          </button>

          {cid && userAddress && (
            <ReceiptLogger
              user={userAddress}
              provider={storageList[selected]?.provider}
              storageId={selected}
              duration={`${rentalDays} days`}
              cid={cid}
            />
          )}
        </div>
      )}

      <ReceiptHistory userAddress={userAddress} />
      <RenterRentals />
    </div>
  );
};

export default RenterView;
