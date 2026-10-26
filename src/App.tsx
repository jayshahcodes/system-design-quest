import { useState } from 'react'
import { topics } from './data/topics'
import { Learn } from './components/Learn'
import { Quiz } from './components/Quiz'
import { DesignGame } from './components/DesignGame'

const sections = [
  { id: 'learn', label: 'Learn', icon: '▤', subtitle: 'Build your foundation' },
  { id: 'quiz', label: 'Quiz', icon: '✧', subtitle: 'Put knowledge to work' },
  { id: 'game', label: 'Design Game', icon: '⌘', subtitle: 'Learn by building' },
] as const
type Section = (typeof sections)[number]['id']

export default function App() {
  const [section, setSection] = useState<Section>('learn')
  const [quizTopic, setQuizTopic] = useState('all')

  function startQuiz(topicId: string) {
    setQuizTopic(topicId)
    setSection('quiz')
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <a href="#main" className="skip-link">Skip to content</a>
        <a className="brand" href="./" aria-label="System Design Quest home"><span className="brand-mark">sq<span>↗</span></span><span>system design<span className="brand-second">quest<span className="brand-dot">.</span></span></span></a>
        <div className="sidebar-label">YOUR LEARNING SPACE</div>
        <nav aria-label="Main navigation">
          {sections.map((item) => <button key={item.id} onClick={() => setSection(item.id)} aria-current={section === item.id ? 'page' : undefined} className={`nav-item ${section === item.id ? 'active' : ''}`}><span className="nav-icon">{item.icon}</span><span>{item.label}<small>{item.subtitle}</small></span><span className="nav-arrow">↗</span></button>)}
        </nav>
        <div className="sidebar-note"><span className="seed-icon">✳</span><strong>Big systems.<br />Small steps.</strong><p>Every great architecture starts with understanding the basics.</p><span className="badge">PHASE 01 · FOUNDATIONS</span></div>
        <div className="sidebar-footer"><span className="status-dot" /> Your next chapter starts here</div>
      </aside>
      <div className="workspace">
        <header className="topbar"><span>YOUR JOURNEY <span className="breadcrumb">/ {sections.find((item) => item.id === section)?.label}</span></span><span className="topbar-right"><span className="status-dot" /> Beginner track <span className="avatar" aria-hidden="true">Y</span></span></header>
        <main id="main" tabIndex={-1}>
          {section === 'learn' && <Learn onQuiz={startQuiz} onBuild={() => setSection('game')} />}
          {section === 'quiz' && <Quiz key={quizTopic} initialTopic={quizTopic} />}
          {section === 'game' && <DesignGame />}
        </main>
        <footer className="page-footer"><span>Built for curious minds.</span><span>{topics.length} topics. Endless possibilities. ↗</span></footer>
      </div>
    </div>
  )
}
