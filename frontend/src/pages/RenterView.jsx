import React, { useEffect, useState } from 'react'
import { getContract } from '../utils/getContract'
import { ethers } from 'ethers'
import FileUploader from '../components/FileUploader'
import { encryptCID } from '../utils/encryption'

const RenterView = () => {
  const [availableStorage, setAvailableStorage] = useState([])
  const [cid, setCid] = useState('')
  const [rentalDays, setRentalDays] = useState(1)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const [contract, setContract] = useState(null)

  const fetchContractAndStorage = async () => {
    try {
      const c = await getContract()
      setContract(c)

      const listings = await c.getAllAvailableStorage()
      const { 0: providers, 1: storageIds, 2: prices, 3: sizes } = listings

      const available = providers.map((provider, i) => ({
        provider,
        storageId: storageIds[i],
        pricePerDay: prices[i],
        sizeInGB: sizes[i],
        isAvailable: true
      }))

      setAvailableStorage(available)
    } catch (err) {
      console.error('Error fetching global listings:', err)
    }
  }

  useEffect(() => {
    fetchContractAndStorage()
  }, [])

  const handleRent = async () => {
    console.log("Selected:", selectedIndex)
    console.log("CID:", cid)
    console.log("Days:", rentalDays)

    if (!contract) return alert("Contract not ready.")
    if (selectedIndex === null || !cid || rentalDays <= 0) {
      alert('Please select a listing and upload file')
      return
    }

    try {
      setLoading(true)
      const storage = availableStorage[selectedIndex]
      const totalCost = ethers.toBigInt(storage.pricePerDay) * ethers.toBigInt(rentalDays)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const renterAddress = await signer.getAddress()
      const encryptedCid = await encryptCID(cid, renterAddress)

      const tx = await contract.rentStorage(
        storage.provider,
        storage.storageId,
        rentalDays,
        encryptedCid,
        { value: totalCost }
      )

      await tx.wait()
      alert('✅ Rented successfully!')
      setCid('')
      setRentalDays(1)
    } catch (err) {
      console.error('Rent failed:', err)
      alert('❌ Rent failed: ' + (err.reason || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Rent Storage</h2>

      <ul className="space-y-2 mb-4">
        {availableStorage.length === 0 ? (
          <p className="text-yellow-300">No available storage listings at the moment.</p>
        ) : (
          availableStorage.map((s, i) => (
            <li
              key={i}
              className={`p-3 rounded cursor-pointer border ${selectedIndex === i ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setSelectedIndex(i)}
            >
              <strong>Provider:</strong> {s.provider}<br />
              <strong>Price:</strong> {Number(s.pricePerDay) / 1e18} ETH/day<br />
              <strong>Size:</strong> {s.sizeInGB} GB<br />
              <strong>Status:</strong> {s.isAvailable ? <span className="text-green-400">Available</span> : <span className="text-red-400">Unavailable</span>}
            </li>
          ))
        )}
      </ul>

      {selectedIndex !== null && (
        <FileUploader storageId={availableStorage[selectedIndex].storageId} onUpload={(newCid) => setCid(newCid)} />
      )}

      <div className="flex flex-col gap-2 mb-4 mt-4">
        <input
          type="number"
          value={rentalDays}
          onChange={(e) => setRentalDays(e.target.value)}
          placeholder="Days to rent"
          className="p-2 rounded text-black"
          min="1"
        />
        <button
          onClick={handleRent}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Renting...' : 'Rent Storage'}
        </button>
      </div>
    </div>
  )
}

export default RenterView
