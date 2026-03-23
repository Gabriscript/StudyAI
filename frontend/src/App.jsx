import { useState } from 'react'
import UploadScreen from './screens/UploadScreen'
import DiagramScreen from './screens/DiagramScreen'

function App() {
  const [screen, setScreen] = useState('upload')
  const [diagramData, setDiagramData] = useState(null)

  const handleDiagramReady = (data) => {
    setDiagramData(data)
    setScreen('diagram')
  }

  // Reset everything back to upload screen
  const handleReset = () => {
    setDiagramData(null)
    setScreen('upload')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {screen === 'upload' && (
        <UploadScreen onDiagramReady={handleDiagramReady} />
      )}
      {screen === 'diagram' && (
        <DiagramScreen data={diagramData} onReset={handleReset} />
      )}
    </div>
  )
}

export default App