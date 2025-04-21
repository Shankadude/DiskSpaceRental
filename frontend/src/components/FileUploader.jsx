import React, { useState } from 'react'
import { createHeliaNode } from '../utils/helia'

const FileUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [cid, setCid] = useState(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.")
  
    setUploading(true)
  
    try {
      const { fs } = await createHeliaNode()
  
      const stream = file.stream()
      const fileCid = await fs.addFile({
        path: file.name,
        content: stream // ✅ this is now a proper AsyncIterable<Uint8Array>
      })
  
      const cidStr = fileCid.toString()
      setCid(cidStr)
      if (onUpload) {
        onUpload(cidStr)
      }
  
      alert("✅ File uploaded to Helia!")
    } catch (err) {
      console.error("Upload error:", err)
      alert("❌ Upload failed: " + (err.message || err.toString()))
    } finally {
      setUploading(false)
    }
  }
  
  

  return (
    <div className="mb-2">
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} className="bg-blue-600 text-white px-3 py-1 rounded ml-2">
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {cid && <p className="text-sm text-green-400">📦 CID: {cid}</p>}
    </div>
  )
}

export default FileUploader
