import React, { useState } from 'react'
import { createHeliaNode } from '../utils/helia'
import { getContract } from '../utils/getContract'

const FileDownloader = ({ storageId }) => {
  const [fileContent, setFileContent] = useState(null)

  const handleDownload = async () => {
    const contract = await getContract()
    const cid = await contract.getCID(storageId)

    const { fs } = await createHeliaNode()
    const stream = fs.cat(cid)
    const chunks = []

    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const blob = new Blob(chunks)
    const url = URL.createObjectURL(blob)

    setFileContent(url)
  }

  return (
    <div>
      <button onClick={handleDownload}>Download File</button>
      {fileContent && <a href={fileContent} download="shared-file">Download Link</a>}
    </div>
  )
}

export default FileDownloader
