import { useState } from 'react'
import { topics } from '../data/topics'

export function Learn({ onQuiz, onBuild }: { onQuiz: (topicId: string) => void; onBuild: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = topics.find((topic) => topic.id === selectedId)

  if (selected) return (
    <div className="page-content">
      <button className="text-button" onClick={() => setSelectedId(null)}>← All topics</button>
      <div className="eyebrow mt-6">FOUNDATIONS / {selected.minutes} MIN READ</div>
      <h1>{selected.title}</h1><p className="page-intro">{selected.summary}</p>
      <article className="lesson panel">
        {selected.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}
        <div className="example"><span className="eyebrow">IN THE REAL WORLD</span><p>{selected.example}</p></div>
        <div className="takeaway"><strong>The takeaway</strong><p>{selected.takeaway}</p></div>
        <button className="primary-button" onClick={() => onQuiz(selected.id)}>Practice this topic ↗</button>
      </article>
    </div>
  )

  return (
    <div className="page-content">
      <div className="eyebrow"><span className="tiny-line" /> LEARN THE BUILDING BLOCKS</div>
      <div className="page-heading"><div><h1>Think big. <span>Start here.</span></h1><p className="page-intro">Understand the ideas behind the systems you use every day.<br className="desktop-break" /> One concept at a time, at your own pace.</p></div><span className="outline-label">BEGINNER FRIENDLY ↗</span></div>
      <div className="hero-banner"><div><span className="badge light-badge">YOUR FIRST QUEST</span><h2>From “how does it work?”<br />to “I can build that.”</h2><p>Learn a concept. Test your intuition. Bring it to life.</p><button className="cream-button" onClick={() => setSelectedId(topics[0].id)}>Explore the foundations <span>↗</span></button></div><div className="hero-diagram" aria-hidden="true"><div className="diagram-node">▣<span>CLIENT</span></div><div className="diagram-line">→</div><div className="diagram-node server-node">▤<span>SERVER</span></div><div className="diagram-line">→</div><div className="diagram-node">▱<span>DATABASE</span></div><div className="diagram-caption">A little curiosity. A lot of connections.</div></div></div>
      <div className="section-heading"><div><h2>Your foundation toolkit <span className="count-badge">05</span></h2><p>Five essentials. A solid place to begin.</p></div><span className="muted small">01 — 05</span></div>
      <div className="topic-grid">
        {topics.map((topic, index) => <button className="topic-card" key={topic.id} onClick={() => setSelectedId(topic.id)}><div className="topic-card-top"><span className={`topic-icon topic-color-${index}`}>{topic.icon}</span><span className="topic-number">0{index + 1}</span></div><span className="topic-title">{topic.title}</span><span className="topic-summary">{topic.summary}</span><span className="topic-card-bottom"><span>◷ {topic.minutes} min read <span className="topic-level">· Beginner</span></span><span className="circle-arrow">↗</span></span></button>)}
        <div className="next-card"><span className="next-icon">⌘</span><h3>Less memorizing.<br />More making.</h3><p>Ready to connect the dots?<br />Build your first architecture.</p><button className="text-button" onClick={onBuild}>Try the Design Game ↗</button></div>
      </div>
      <div className="bottom-note"><span>✧</span><p><strong>There’s no perfect starting point.</strong> Pick a topic that sparks your curiosity.</p><button className="text-button" onClick={() => onQuiz('all')}>Start Quiz →</button></div>
    </div>
  )
}
