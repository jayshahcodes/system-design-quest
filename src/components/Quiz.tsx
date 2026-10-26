import { useState } from 'react'
import { questions } from '../data/questions'
import { topics } from '../data/topics'

export function Quiz({ initialTopic }: { initialTopic: string }) {
  const [topicId, setTopicId] = useState(initialTopic)
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const pool = questions.filter((question) => topicId === 'all' || question.topicId === topicId)
  const finished = started && answers.length === pool.length
  const question = pool[answers.length]
  const score = answers.filter((answer, index) => answer === pool[index].answer).length

  function restart() {
    setAnswers([])
    setSelected(null)
    setRevealed(false)
    setStarted(false)
  }

  return (
    <div className="page-content">
      <div className="eyebrow">CHECK YOUR INTUITION</div><h1>A little practice. <span>A deeper understanding.</span></h1><p className="page-intro">Short questions, real scenarios, and a lesson in every answer.</p>
      {!started ? <section className="panel quiz-panel"><span className="large-icon">✧</span><h2>Ready for a knowledge check?</h2><p>Choose a topic or practice all five. You’ll see an explanation after each answer.</p><label htmlFor="quiz-topic">Practice area</label><select id="quiz-topic" value={topicId} onChange={(event) => setTopicId(event.target.value)}><option value="all">All foundation topics</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}</select><p className="muted small">{pool.length} questions · Multiple choice & scenarios · No time limit</p><button className="primary-button" onClick={() => setStarted(true)}>Start Quiz ↗</button></section>
        : finished ? <section className="panel quiz-panel" aria-live="polite"><span className="large-icon">✳</span><div className="eyebrow">QUEST COMPLETE</div><h2>{score === pool.length ? 'You’ve got the foundations!' : 'Every attempt is a step forward.'}</h2><p className="score">{score}<span> / {pool.length}</span></p><p>{Math.round(score / pool.length * 100)}% correct. Revisit the lessons or try again to build confidence.</p><button className="primary-button" onClick={restart}>Practice again ↗</button></section>
          : <section className="panel quiz-panel"><div className="quiz-meta"><span className="badge">{question.kind === 'scenario' ? 'SCENARIO' : 'QUICK CHECK'}</span><span className="muted small">Question {answers.length + 1} of {pool.length}</span></div><progress value={answers.length} max={pool.length} aria-label="Quiz progress" /><p className="eyebrow">{topics.find((topic) => topic.id === question.topicId)?.title}</p><h2>{question.prompt}</h2><fieldset disabled={revealed}><legend className="sr-only">Select an answer</legend>{question.options.map((option, index) => <label className={`answer-option ${selected === index ? 'selected' : ''} ${revealed && index === question.answer ? 'correct' : ''}`} key={option}><input type="radio" name={question.id} value={index} checked={selected === index} onChange={() => setSelected(index)} /><span>{option}</span></label>)}</fieldset>{revealed && <div className="answer-feedback" role="status"><strong>{selected === question.answer ? 'Exactly right.' : 'Not quite — here’s why.'}</strong><p>{question.explanation}</p></div>}<div className="quiz-actions">{!revealed ? <button className="primary-button" disabled={selected === null} onClick={() => setRevealed(true)}>Check answer</button> : <button className="primary-button" onClick={() => { setAnswers([...answers, selected!]); setSelected(null); setRevealed(false) }}>{answers.length + 1 === pool.length ? 'See my score' : 'Next question →'}</button>}<button className="text-button" onClick={restart}>Restart quiz</button></div></section>}
    </div>
  )
}
