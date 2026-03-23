import { useState } from 'react'
import dragonAnxious from '../assets/images/dragon-anxious.png'
import dragonRelaxed from '../assets/images/dragon-relaxed.png'
// Final boss battle screen — student writes a full synthesis answer
export default function BossBattle({ data, anxiety, anxietyPercent, onRelief, onBack }) {
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [evaluating, setEvaluating] = useState(false)

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setEvaluating(true)

    // Mock final evaluation — replace with /api/evaluate-final later
    await new Promise(resolve => setTimeout(resolve, 1200))

    // Check how many required concepts are mentioned
    const covered = data.boss.required_concepts.filter(concept =>
      answer.toLowerCase().includes(concept.toLowerCase())
    )
    const missing = data.boss.required_concepts.filter(concept =>
      !answer.toLowerCase().includes(concept.toLowerCase())
    )

    const score = Math.round((covered.length / data.boss.required_concepts.length) * 100)
    const defeated = missing.length === 0

    // Apply final relief
    const damage = defeated ? 10 : missing.length <= 2 ? 5 : 2
    onRelief(damage)

    setResult({ defeated, score, missing, damage })
    setEvaluating(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">

      {/* Dragon image — large */}
      <img
        src={anxietyPercent <= 30
          ? dragonRelaxed
          : dragonAnxious}
        alt="Dragon"
        className="w-48 h-48 object-contain mb-6"
      />

      <h2 className="text-3xl font-bold text-yellow-400 mb-2">
        Final Challenge
      </h2>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        {data.boss.final_question}
      </p>

      {!result ? (
        <>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write your complete answer here..."
            className="w-full max-w-2xl bg-gray-800 text-white rounded-xl p-4
                       border border-gray-700 focus:border-yellow-500 outline-none
                       resize-none h-48 text-sm"
          />

          <div className="flex gap-4 mt-6">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600
                         text-white rounded-xl transition-all"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || evaluating}
              className="px-10 py-3 bg-yellow-500 hover:bg-yellow-400
                         disabled:bg-gray-700 disabled:text-gray-500
                         text-gray-900 font-bold rounded-xl transition-all"
            >
              {evaluating ? 'Evaluating...' : 'Submit Final Answer'}
            </button>
          </div>
        </>
      ) : (
        // Result screen
        <div className="text-center max-w-lg">
          {result.defeated ? (
            <>
              <p className="text-5xl mb-4">🎉</p>
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                Dragon Calmed Down!
              </h3>
              <p className="text-gray-300">
                Score: {result.score}% — You covered all the key concepts!
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl mb-4">💪</p>
              <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                Good effort! Keep going.
              </h3>
              <p className="text-gray-400 mb-4">Score: {result.score}%</p>
              {result.missing.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-4 text-left">
                  <p className="text-red-400 text-sm font-semibold mb-2">
                    Missing concepts:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {result.missing.map(c => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => { setResult(null); setAnswer('') }}
                className="mt-6 px-8 py-3 bg-purple-600 hover:bg-purple-500
                           text-white font-bold rounded-xl transition-all"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}