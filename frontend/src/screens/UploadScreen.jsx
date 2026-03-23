import { useState } from 'react'
import { mockDiagram } from '../mock/diagramData'

// Upload screen — first thing the user sees
// Uses mock data until Claude API credits are available
const USE_MOCK = true

export default function UploadScreen({ onDiagramReady }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (selectedFile) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(selectedFile.type)) {
      setError('Only PDF, JPG, PNG or WEBP files are supported.')
      return
    }
    setFile(selectedFile)
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      if (USE_MOCK) {
        // Simulate network delay with mock data
        await new Promise(resolve => setTimeout(resolve, 1500))
        onDiagramReady(mockDiagram)
        return
      }

      // Real API call — enable when credits are available
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('http://localhost:5063/api/analyze', {
        method: 'POST',
        body: formData
      })
      if (!response.ok) throw new Error('Analysis failed')
      const data = await response.json()
      onDiagramReady(data)

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-white mb-3">StudyAI</h1>
        <p className="text-gray-400 text-lg">
          Upload your study material — defeat your anxiety dragon 🐉
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => document.getElementById('fileInput').click()}
        className={`
          w-full max-w-lg border-2 border-dashed rounded-2xl p-12
          flex flex-col items-center justify-center cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'border-purple-400 bg-purple-900/20'
            : 'border-gray-600 bg-gray-800/50 hover:border-purple-500 hover:bg-gray-800'
          }
        `}
      >
        <div className="text-6xl mb-4">📄</div>
        <p className="text-gray-300 font-medium text-lg">
          {file ? file.name : 'Drop your file here'}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          PDF, JPG, PNG, WEBP supported
        </p>
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-red-400 text-sm">{error}</p>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        className={`
          mt-8 px-10 py-4 rounded-xl font-semibold text-lg
          transition-all duration-200
          ${file && !loading
            ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {loading ? 'Analyzing...' : 'Analyze →'}
      </button>
    </div>
  )
}