import { useState } from 'react'
import StudyMap from '../components/StudyMap'
import DragonPanel from '../components/DragonPanel'
import NodeModal from '../components/NodeModal'
import BossBattle from '../components/BossBattle'

export default function DiagramScreen({ data, onReset }) {
  // Track which nodes are unlocked (answered or peeked)
  const [unlockedNodes, setUnlockedNodes] = useState({ root: true })
  // 'correct' | 'peeked' | null per node
  const [nodeStatus, setNodeStatus] = useState({})
  // Currently open node modal
  const [activeNode, setActiveNode] = useState(null)
  // Dragon anxiety: starts at hp_max, decreases as student answers
  const [anxiety, setAnxiety] = useState(data.boss.hp_max)
  // Consecutive correct answers streak
  const [streak, setStreak] = useState(0)
  // Wrong answer count per node (for anti-frustration system)
  const [wrongCounts, setWrongCounts] = useState({})
  // Show boss battle screen
  const [showBoss, setShowBoss] = useState(false)

  const anxietyPercent = Math.round((anxiety / data.boss.hp_max) * 100)

  // Check if final question should be available
  const allNodesUnlocked = data.nodes.every(n => unlockedNodes[n.id])
  const bossLowAnxiety = anxietyPercent <= 20
  const canFaceBoss = (allNodesUnlocked || bossLowAnxiety) && !showBoss

  const handleNodeClick = (nodeId) => {
    // Only allow clicking unlocked nodes that have questions
    if (!unlockedNodes[nodeId]) return
    if (!data.questions[nodeId]) return
    setActiveNode(nodeId)
  }

  const applyRelief = (amount) => {
    setAnxiety(prev => Math.max(0, prev - amount))
  }

  const handleCorrectAnswer = (nodeId, score) => {
    // Calculate relief based on score
    let relief = score >= 80 ? 10 : score >= 50 ? Math.round(6 + (score - 50) / 15) : 6

    // Streak bonus
    const newStreak = streak + 1
    setStreak(newStreak)
    if (newStreak >= 3) relief += 5

    // Low anxiety bonus
    if (anxietyPercent < 30) relief += 2

    applyRelief(relief)
    setNodeStatus(prev => ({ ...prev, [nodeId]: 'correct' }))
    unlockChildren(nodeId)
    setActiveNode(null)
  }

  const handlePeek = (nodeId) => {
    const wasFree = (wrongCounts[nodeId] || 0) >= 2
    if (!wasFree) applyRelief(4)
    setStreak(0)
    setNodeStatus(prev => ({ ...prev, [nodeId]: 'peeked' }))
    unlockChildren(nodeId)
  }

  const handleWrongAnswer = (nodeId) => {
    setStreak(0)
    setWrongCounts(prev => ({
      ...prev,
      [nodeId]: (prev[nodeId] || 0) + 1
    }))
  }

  const unlockChildren = (nodeId) => {
    // Find all nodes that are targets of edges from this node
    const childIds = data.edges
      .filter(e => e.source === nodeId)
      .map(e => e.target)
    setUnlockedNodes(prev => {
      const next = { ...prev }
      childIds.forEach(id => { next[id] = true })
      return next
    })
  }

  if (showBoss) {
    return (
      <BossBattle
        data={data}
        anxiety={anxiety}
        anxietyPercent={anxietyPercent}
        onRelief={applyRelief}
        onBack={() => setShowBoss(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* Top bar */}
<div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
  <h1 className="text-xl font-bold text-white">{data.topic}</h1>
  <div className="flex items-center gap-4">
    <span className="text-gray-400 text-sm">
      {Object.keys(unlockedNodes).length} / {data.nodes.length} nodes unlocked
    </span>
    <button
      onClick={onReset}
      className="px-4 py-2 bg-gray-700 hover:bg-gray-600
                 text-gray-300 text-sm rounded-lg transition-all"
    >
      ← New Topic
    </button>
  </div>
</div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Study map — left side */}
        <div className="flex-1">
          <StudyMap
            nodes={data.nodes}
            edges={data.edges}
            unlockedNodes={unlockedNodes}
            nodeStatus={nodeStatus}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* Dragon panel — right side */}
        <div className="w-72 border-l border-gray-700 flex flex-col">
          <DragonPanel
            boss={data.boss}
            anxiety={anxiety}
            anxietyPercent={anxietyPercent}
            streak={streak}
          />

          {/* Face the boss button */}
          {canFaceBoss && (
            <div className="p-4 border-t border-gray-700">
              <p className="text-yellow-400 text-sm text-center mb-3">
                Ready for the final blow? 🐉
              </p>
              <button
                onClick={() => setShowBoss(true)}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400
                           text-gray-900 font-bold rounded-xl transition-all"
              >
                Face the Dragon
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Node question modal */}
      {activeNode && (
        <NodeModal
          nodeId={activeNode}
          label={data.nodes.find(n => n.id === activeNode)?.label}
          questions={data.questions[activeNode]}
          peekAnswer={data.peek_answers[activeNode]}
          wrongCount={wrongCounts[activeNode] || 0}
          onCorrect={(score) => handleCorrectAnswer(activeNode, score)}
          onWrong={() => handleWrongAnswer(activeNode)}
          onPeek={() => handlePeek(activeNode)}
          onClose={() => setActiveNode(null)}
        />
      )}
    </div>
  )
}