import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { topics } from '../data/topics'
import type { Topic } from '../types'
import {
  componentIcons, learnCopy, learningLevel, learningLevels, lessonEyebrow,
  readingTime, symbols, topicCount, topicNumber, topicRange,
} from '../constants'
import { Badge } from './shared/Badge'
import { Button } from './shared/Button'
import { PageHeader } from './shared/PageHeader'
import { SelectField } from './shared/Fields'

interface TopicCardProps {
  topic: Topic
  index: number
  onSelect: (id: string) => void
}

function TopicCard({ topic, index, onSelect }: TopicCardProps) {
  function selectTopic() {
    onSelect(topic.id)
  }

  return (
    <Button className="topic-card" onClick={selectTopic}>
      <div className="topic-card-top">
        <span className={`topic-icon topic-color-${index % 5}`}>{topic.icon}</span>
        <span className="topic-number">{topicNumber(index)}</span>
      </div>
      <span className="topic-title">{topic.title}</span>
      <span className="topic-summary">{topic.summary}</span>
      <span className="topic-card-bottom">
        <span>
          {readingTime(topic.minutes)}
          <span className="topic-level">{learningLevel(topic.level ?? 'Beginner')}</span>
        </span>
        <span className="circle-arrow">{symbols.arrow}</span>
      </span>
    </Button>
  )
}

function renderLessonSection(section: Topic['sections'][number]) {
  return (
    <section key={section.heading}>
      <h2>{section.heading}</h2>
      <p>{section.body}</p>
    </section>
  )
}

function renderSource(source: NonNullable<Topic['sources']>[number]) {
  return (
    <li key={source.url}>
      <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
      <span className="muted small">{source.publisher}</span>
    </li>
  )
}

function renderLevel(level: (typeof learningLevels)[number]) {
  return <option key={level} value={level}>{level}</option>
}

interface LessonProps {
  topic: Topic
  onBack: () => void
  onQuiz: (id: string) => void
}

function Lesson({ topic, onBack, onQuiz }: LessonProps) {
  function practiceTopic() {
    onQuiz(topic.id)
  }

  return (
    <div className="page-content">
      <Button variant="text" onClick={onBack}>{learnCopy.back}</Button>
      <div className="eyebrow mt-6">{lessonEyebrow(topic.minutes)}</div>
      <h1>{topic.title}</h1>
      <p className="page-intro">{topic.summary}</p>
      <Badge>{topic.level ?? learningLevels[0]}</Badge>
      <article className="lesson panel">
        {topic.sections.map(renderLessonSection)}
        <div className="example">
          <span className="eyebrow">{learnCopy.realWorld}</span>
          <p>{topic.example}</p>
        </div>
        <div className="takeaway">
          <strong>{learnCopy.takeaway}</strong>
          <p>{topic.takeaway}</p>
        </div>
        {topic.sources && topic.sources.length > 0 && (
          <section className="lesson-sources">
            <h2>{learnCopy.sources}</h2>
            <p>{learnCopy.sourceNote}</p>
            <ul>{topic.sources.map(renderSource)}</ul>
          </section>
        )}
        <Button onClick={practiceTopic}>{learnCopy.practice}</Button>
      </article>
    </div>
  )
}

function HeroDiagram() {
  return (
    <div className="hero-diagram" aria-hidden="true">
      <div className="diagram-node">
        {componentIcons.Client}
        <span>{learnCopy.client}</span>
      </div>
      <div className="diagram-line">{symbols.right}</div>
      <div className="diagram-node server-node">
        {componentIcons['App Server']}
        <span>{learnCopy.server}</span>
      </div>
      <div className="diagram-line">{symbols.right}</div>
      <div className="diagram-node">
        {componentIcons['SQL DB']}
        <span>{learnCopy.database}</span>
      </div>
      <div className="diagram-caption">{learnCopy.diagramCaption}</div>
    </div>
  )
}

export function Learn({ onQuiz, onBuild }: { onQuiz: (topicId: string) => void; onBuild: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [level, setLevel] = useState('all')

  function isSelectedTopic(topic: Topic) {
    return topic.id === selectedId
  }

  function showAllTopics() {
    setSelectedId(null)
  }

  function exploreFoundations() {
    setSelectedId(topics[0].id)
  }

  function practiceAllTopics() {
    onQuiz('all')
  }

  function changeLevel(event: ChangeEvent<HTMLSelectElement>) {
    setLevel(event.target.value)
  }

  function matchesLevel(topic: Topic) {
    return level === 'all' || (topic.level ?? learningLevels[0]) === level
  }

  function renderTopic(topic: Topic, index: number) {
    return <TopicCard key={topic.id} topic={topic} index={index} onSelect={setSelectedId} />
  }

  const selected = topics.find(isSelectedTopic)
  const visibleTopics = topics.filter(matchesLevel)

  if (selected) {
    return <Lesson topic={selected} onBack={showAllTopics} onQuiz={onQuiz} />
  }

  return (
    <div className="page-content">
      <PageHeader
        eyebrow={<><span className="tiny-line" />{learnCopy.eyebrow}</>}
        title={<>{learnCopy.title}<span>{learnCopy.titleAccent}</span></>}
        intro={<>{learnCopy.intro}<br className="desktop-break" />{learnCopy.introNext}</>}
        outline={learnCopy.outline}
      />
      <div className="hero-banner">
        <div>
          <Badge className="badge light-badge">{learnCopy.firstQuest}</Badge>
          <h2>{learnCopy.heroTitle}<br />{learnCopy.heroTitleNext}</h2>
          <p>{learnCopy.heroDescription}</p>
          <Button variant="cream" onClick={exploreFoundations}>
            {learnCopy.explore}<span>{symbols.arrow}</span>
          </Button>
        </div>
        <HeroDiagram />
      </div>
      <div className="section-heading">
        <div>
          <h2>{learnCopy.toolkit}<Badge variant="count-badge">{topicCount(visibleTopics.length)}</Badge></h2>
          <p>{learnCopy.essentials}</p>
        </div>
        <span className="muted small">{topicRange(visibleTopics.length)}</span>
      </div>
      <div className="learning-filter">
        <SelectField id="learning-level" label={learnCopy.filter} value={level} onChange={changeLevel}>
          <option value="all">{learnCopy.allLevels}</option>
          {learningLevels.map(renderLevel)}
        </SelectField>
      </div>
      {visibleTopics.length === 0 && <p className="muted">{learnCopy.empty}</p>}
      <div className="topic-grid">
        {visibleTopics.map(renderTopic)}
        <div className="next-card">
          <span className="next-icon">{symbols.game}</span>
          <h3>{learnCopy.lessMemorizing}<br />{learnCopy.moreMaking}</h3>
          <p>{learnCopy.connectDots}<br />{learnCopy.firstArchitecture}</p>
          <Button variant="text" onClick={onBuild}>{learnCopy.tryGame}</Button>
        </div>
      </div>
      <div className="bottom-note">
        <span>{symbols.quiz}</span>
        <p><strong>{learnCopy.startingPoint}</strong>{learnCopy.curiosity}</p>
        <Button variant="text" onClick={practiceAllTopics}>{learnCopy.startQuiz}</Button>
      </div>
    </div>
  )
}
