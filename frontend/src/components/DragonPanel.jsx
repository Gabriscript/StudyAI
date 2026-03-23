import dragonAnxious from '../assets/images/dragon-anxious.png'
import dragonRelaxed from '../assets/images/dragon-relaxed.png'
import dragonCelebratory from '../assets/images/dragon-celebratory.png'

export default function DragonPanel({ boss, anxiety, anxietyPercent, streak }) {
  const isCalm = anxietyPercent <= 30

  // Celebratory takes priority when streak >= 3
  const dragonImg = streak >= 3
    ? dragonCelebratory
    : isCalm
    ? dragonRelaxed
    : dragonAnxious

  return (
    <div className="flex flex-col items-center p-6 gap-6">
      <h2 className="text-lg font-bold text-white text-center">{boss.name}</h2>

      <img
        src={dragonImg}
        alt="Dragon"
        className="w-40 h-40 object-contain transition-all duration-700"
      />

      {/* Anxiety bar */}
      <div className="w-full">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Anxiety</span>
          <span className={isCalm ? 'text-green-400' : 'text-red-400'}>
            {anxietyPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500
              ${anxietyPercent > 60 ? 'bg-red-500' :
                anxietyPercent > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${anxietyPercent}%` }}
          />
        </div>
      </div>

      {/* Streak indicator */}
      {streak > 0 && (
        <div className="text-center">
          <span className={`font-bold text-sm ${streak >= 3 ? 'text-yellow-300 text-base' : 'text-yellow-400'}`}>
            {streak >= 3 ? '🎉 Streak x' + streak + ' — +5 bonus!' : '🔥 Streak x' + streak}
          </span>
        </div>
      )}

      {/* Status message */}
      <p className="text-gray-400 text-xs text-center">
        {streak >= 3
          ? 'The dragon loves your energy!'
          : anxietyPercent > 60
          ? 'The dragon is very anxious...'
          : anxietyPercent > 30
          ? 'Getting calmer. Keep going!'
          : 'Almost relaxed! One more push!'}
      </p>
    </div>
  )
}