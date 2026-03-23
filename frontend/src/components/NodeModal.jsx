import { useState } from 'react'

const BACKEND_URL = 'http://localhost:5063'

export default function NodeModal({
    nodeId, label, questions, peekAnswer,
    wrongCount, onCorrect, onWrong, onPeek, onClose
}) {
    const [answer, setAnswer] = useState('')
    const [feedback, setFeedback] = useState(null)
    const [showPeek, setShowPeek] = useState(false)
    const [evaluating, setEvaluating] = useState(false)

    const [question] = useState(() =>
        questions[Math.floor(Math.random() * questions.length)]
    )

    const isFreepeek = wrongCount >= 2

    const handlePeek = () => {
        setShowPeek(true)
        onPeek()
    }

    const handleSubmit = async () => {
        if (!answer.trim()) return
        setEvaluating(true)

        try {
            const response = await fetch(`${BACKEND_URL}/api/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nodeLabel: label,
                    peekAnswer: peekAnswer,
                    studentAnswer: answer
                })
            })

            if (!response.ok) throw new Error('Evaluation failed')

            const result = await response.json()

            setFeedback({
                correct: result.correct,
                score: result.score,
                message: result.feedback
            })

            if (result.correct) {
                onCorrect(result.score)
            } else {
                onWrong()
                setEvaluating(false)
            }

        } catch (err) {
            setFeedback({
                correct: false,
                score: 0,
                message: 'Connection error — is the backend running?'
            })
            setEvaluating(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-lg p-6 border border-gray-700">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-bold text-purple-400">{label}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
                </div>

                {/* Question */}
                <p className="text-white mb-4">{question}</p>

                {/* Peek answer */}
                {showPeek && (
                    <div className="bg-orange-900/30 border border-orange-600 rounded-xl p-4 mb-4">
                        <p className="text-orange-300 text-sm">{peekAnswer}</p>
                    </div>
                )}

                {/* Answer input */}
                {!feedback?.correct && (
                    <>
                        <textarea
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder="Type your answer..."
                            className="w-full bg-gray-700 text-white rounded-xl p-3 text-sm
                         border border-gray-600 focus:border-purple-500 outline-none
                         resize-none h-28"
                        />

                        {/* Feedback message */}
                        {feedback && (
                            <div className="mt-2">
                                <p className="text-red-400 text-sm">{feedback.message}</p>
                                {feedback.score > 0 && (
                                    <p className="text-gray-500 text-xs mt-1">Score: {feedback.score}/100</p>
                                )}
                            </div>
                        )}

                        {/* Wrong count warning */}
                        {wrongCount >= 1 && !showPeek && (
                            <p className="text-yellow-500 text-xs mt-2">
                                {isFreepeek
                                    ? '💡 You can now peek for free — no penalty'
                                    : `${2 - wrongCount} more wrong answer before free peek`}
                            </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={!answer.trim() || evaluating}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500
                           disabled:bg-gray-700 disabled:text-gray-500
                           text-white font-semibold rounded-xl transition-all"
                            >
                                {evaluating ? 'Checking...' : 'Submit'}
                            </button>

                            {!showPeek && (
                                <button
                                    onClick={handlePeek}
                                    className={`px-4 py-3 rounded-xl font-semibold transition-all
                    ${isFreepeek
                                            ? 'bg-green-700 hover:bg-green-600 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                >
                                    {isFreepeek ? '👁 Free Peek' : '👁 Peek (-4)'}
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* Success state */}
                {feedback?.correct && (
                    <div className="text-center py-4">
                        <p className="text-green-400 font-bold text-lg mb-2">✓ Correct!</p>
                        <p className="text-gray-400 text-sm">{feedback.message}</p>
                        <p className="text-gray-500 text-xs mt-1">Score: {feedback.score}/100</p>
                    </div>
                )}
            </div>
        </div>
    )
}