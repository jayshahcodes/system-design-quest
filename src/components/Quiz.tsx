import { useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { questions } from '../data/questions'
import { topics } from '../data/topics'
import type { QuizQuestion, Topic } from '../types'
import { questionProgress, quizCopy, quizDetails, quizResult, scoreTotal, symbols } from '../constants'
import { Badge } from './shared/Badge'
import { Button } from './shared/Button'
import { SelectField } from './shared/Fields'
import { TopicOptions } from './shared/Options'
import { PageHeader } from './shared/PageHeader'

function QuizPanel({ children, complete = false }: { children: ReactNode; complete?: boolean }) {
  return (
    <section className="panel quiz-panel" aria-live={complete ? 'polite' : undefined}>
      {children}
    </section>
  )
}

interface AnswerOptionProps {
  option: string
  index: number
  question: QuizQuestion
  selected: number | null
  revealed: boolean
  onSelect: (index: number) => void
}

function AnswerOption({ option, index, question, selected, revealed, onSelect }: AnswerOptionProps) {
  function selectAnswer() {
    onSelect(index)
  }

  return (
    <label className={`answer-option ${selected === index ? 'selected' : ''} ${revealed && index === question.answer ? 'correct' : ''}`}>
      <input
        type="radio"
        name={question.id}
        value={index}
        checked={selected === index}
        onChange={selectAnswer}
      />
      <span>{option}</span>
    </label>
  )
}

export function Quiz({ initialTopic }: { initialTopic: string }) {
  const [topicId, setTopicId] = useState(initialTopic)
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  function isPracticeQuestion(question: QuizQuestion) {
    return topicId === 'all' || question.topicId === topicId
  }

  const pool = questions.filter(isPracticeQuestion)
  const finished = started && answers.length === pool.length
  const question = pool[answers.length]

  function isCorrectAnswer(answer: number, index: number) {
    return answer === pool[index].answer
  }

  function isQuestionTopic(topic: Topic) {
    return topic.id === question.topicId
  }

  const score = answers.filter(isCorrectAnswer).length

  function restart() {
    setAnswers([])
    setSelected(null)
    setRevealed(false)
    setStarted(false)
  }

  function changeTopic(event: ChangeEvent<HTMLSelectElement>) {
    setTopicId(event.target.value)
  }

  function start() {
    setStarted(true)
  }

  function reveal() {
    setRevealed(true)
  }

  function nextQuestion() {
    setAnswers([...answers, selected!])
    setSelected(null)
    setRevealed(false)
  }

  function renderAnswer(option: string, index: number) {
    return (
      <AnswerOption
        key={option}
        option={option}
        index={index}
        question={question}
        selected={selected}
        revealed={revealed}
        onSelect={setSelected}
      />
    )
  }

  return (
    <div className="page-content">
      <PageHeader
        eyebrow={quizCopy.eyebrow}
        title={<>{quizCopy.title}<span>{quizCopy.titleAccent}</span></>}
        intro={quizCopy.intro}
      />
      {!started ? (
        <QuizPanel>
          <span className="large-icon">{symbols.quiz}</span>
          <h2>{quizCopy.ready}</h2>
          <p>{quizCopy.description}</p>
          <SelectField id="quiz-topic" label={quizCopy.area} value={topicId} onChange={changeTopic}>
            <option value="all">{quizCopy.allTopics}</option>
            <TopicOptions />
          </SelectField>
          <p className="muted small">{quizDetails(pool.length)}</p>
          <Button onClick={start}>{quizCopy.start}</Button>
        </QuizPanel>
      ) : finished ? (
        <QuizPanel complete>
          <span className="large-icon">{symbols.seed}</span>
          <div className="eyebrow">{quizCopy.complete}</div>
          <h2>{score === pool.length ? quizCopy.perfect : quizCopy.forward}</h2>
          <p className="score">{score}<span>{scoreTotal(pool.length)}</span></p>
          <p>{quizResult(score, pool.length)}</p>
          <Button onClick={restart}>{quizCopy.again}</Button>
        </QuizPanel>
      ) : (
        <QuizPanel>
          <div className="quiz-meta">
            <Badge>{question.kind === 'scenario' ? quizCopy.scenario : quizCopy.quick}</Badge>
            <span className="muted small">{questionProgress(answers.length + 1, pool.length)}</span>
          </div>
          <progress value={answers.length} max={pool.length} aria-label={quizCopy.progress} />
          <p className="eyebrow">{topics.find(isQuestionTopic)?.title}</p>
          <h2>{question.prompt}</h2>
          <fieldset disabled={revealed}>
            <legend className="sr-only">{quizCopy.selectAnswer}</legend>
            {question.options.map(renderAnswer)}
          </fieldset>
          {revealed && (
            <div className="answer-feedback" role="status">
              <strong>{selected === question.answer ? quizCopy.correct : quizCopy.incorrect}</strong>
              <p>{question.explanation}</p>
            </div>
          )}
          <div className="quiz-actions">
            {!revealed ? (
              <Button disabled={selected === null} onClick={reveal}>{quizCopy.check}</Button>
            ) : (
              <Button onClick={nextQuestion}>
                {answers.length + 1 === pool.length ? quizCopy.score : quizCopy.next}
              </Button>
            )}
            <Button variant="text" onClick={restart}>{quizCopy.restart}</Button>
          </div>
        </QuizPanel>
      )}
    </div>
  )
}
