import { useRef, useEffect, useState } from 'react'

// Renders node cards in level rows with SVG lines connecting them
export default function StudyMap({ nodes, edges, unlockedNodes, nodeStatus, onNodeClick }) {
  const containerRef = useRef(null)
  const [nodeRects, setNodeRects] = useState({})

  // Group nodes by level
  const byLevel = nodes.reduce((acc, node) => {
    acc[node.level] = acc[node.level] || []
    acc[node.level].push(node)
    return acc
  }, {})

  // After render, measure each node card's position relative to container
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current.getBoundingClientRect()
    const rects = {}

    nodes.forEach(node => {
      const el = document.getElementById(`node-${node.id}`)
      if (!el) return
      const r = el.getBoundingClientRect()
      rects[node.id] = {
        x: r.left - container.left + r.width / 2,
        y: r.top - container.top + r.height / 2,
        w: r.width,
        h: r.height
      }
    })

    setNodeRects(rects)
  }, [nodes, unlockedNodes])

  return (
    <div ref={containerRef} className="relative h-full flex flex-col items-center justify-center gap-12 p-8">

      {/* SVG layer for connection lines — sits behind node cards */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map(edge => {
          const from = nodeRects[edge.source]
          const to = nodeRects[edge.target]
          if (!from || !to) return null

          const unlocked = unlockedNodes[edge.target]

          return (
            <line
              key={`${edge.source}-${edge.target}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={unlocked ? '#7c3aed' : '#374151'}
              strokeWidth={unlocked ? 2 : 1}
              strokeDasharray={unlocked ? 'none' : '4 4'}
              opacity={unlocked ? 0.8 : 0.4}
            />
          )
        })}
      </svg>

      {/* Node cards — rendered on top of SVG */}
      {[1, 2, 3].map(level => (
        <div key={level} className="flex gap-6 justify-center flex-wrap relative z-10">
          {(byLevel[level] || []).map(node => (
            <NodeCard
              key={node.id}
              node={node}
              unlocked={!!unlockedNodes[node.id]}
              status={nodeStatus[node.id]}
              onClick={() => onNodeClick(node.id)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function NodeCard({ node, unlocked, status, onClick }) {
  const baseStyle = "w-44 rounded-xl p-4 cursor-pointer transition-all duration-200 border-2 text-center"

const colorStyle = !unlocked
  ? 'bg-gray-800 border-gray-700 opacity-40 cursor-not-allowed'
  : status === 'correct'
  ? 'bg-green-800 border-green-500 hover:border-green-400'
  : status === 'peeked'
  ? 'bg-orange-800 border-orange-500 hover:border-orange-400'
  : 'bg-gray-800 border-purple-600 hover:border-purple-400 hover:bg-gray-700'

  return (
    <div
      id={`node-${node.id}`}
      className={`${baseStyle} ${colorStyle}`}
      onClick={onClick}
    >
      <div className="font-bold text-white text-sm">{node.label}</div>
      {node.sublabel && (
        <div className="text-gray-400 text-xs mt-1">{node.sublabel}</div>
      )}
      {!unlocked && <div className="text-gray-600 text-xs mt-2">🔒</div>}
      {status === 'correct' && <div className="text-green-400 text-xs mt-2">✓ Correct</div>}
      {status === 'peeked' && <div className="text-orange-400 text-xs mt-2">👁 Peeked</div>}
    </div>
  )
}