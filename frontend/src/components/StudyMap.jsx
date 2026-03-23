// Study map — renders nodes as interactive cards in a tree layout
export default function StudyMap({ nodes, edges, unlockedNodes, nodeStatus, onNodeClick }) {

  // Group nodes by level for simple layout
  const byLevel = nodes.reduce((acc, node) => {
    acc[node.level] = acc[node.level] || []
    acc[node.level].push(node)
    return acc
  }, {})

  return (
    <div className="h-full flex flex-col items-center justify-center gap-12 p-8">
      {[1, 2, 3].map(level => (
        <div key={level} className="flex gap-6 justify-center flex-wrap">
          {(byLevel[level] || []).map(node => (
            <NodeCard
              key={node.id}
              node={node}
              unlocked={!!unlockedNodes[node.id]}
              status={nodeStatus[node.id]}
              hasQuestion={true}
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
    ? 'bg-green-900/40 border-green-500 hover:border-green-400'
    : status === 'peeked'
    ? 'bg-orange-900/40 border-orange-500 hover:border-orange-400'
    : 'bg-gray-800 border-purple-600 hover:border-purple-400 hover:bg-gray-700'

  return (
    <div className={`${baseStyle} ${colorStyle}`} onClick={onClick}>
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