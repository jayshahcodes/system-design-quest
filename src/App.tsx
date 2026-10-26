import { useState } from 'react'
import { topics } from './data/topics'
import { Learn } from './components/Learn'
import { Quiz } from './components/Quiz'
import { DesignGame } from './components/DesignGame'
import { Badge } from './components/shared/Badge'
import { Button } from './components/shared/Button'
import { appCopy, sections, symbols, topicFooter } from './constants'
import type { NavigationItem, Section } from './constants'

interface NavigationButtonProps {
  item: NavigationItem
  active: boolean
  onNavigate: (section: Section) => void
}

function NavigationButton({ item, active, onNavigate }: NavigationButtonProps) {
  function navigate() {
    onNavigate(item.id)
  }

  return (
    <Button
      onClick={navigate}
      aria-current={active ? 'page' : undefined}
      className={`nav-item ${active ? 'active' : ''}`}
    >
      <span className="nav-icon">{item.icon}</span>
      <span>
        {item.label}
        <small>{item.subtitle}</small>
      </span>
      <span className="nav-arrow">{symbols.arrow}</span>
    </Button>
  )
}

export default function App() {
  const [section, setSection] = useState<Section>('learn')
  const [quizTopic, setQuizTopic] = useState('all')

  function startQuiz(topicId: string) {
    setQuizTopic(topicId)
    setSection('quiz')
  }

  function startBuilding() {
    setSection('game')
  }

  function isCurrentSection(item: NavigationItem) {
    return item.id === section
  }

  function renderNavigation(item: NavigationItem) {
    return (
      <NavigationButton
        key={item.id}
        item={item}
        active={isCurrentSection(item)}
        onNavigate={setSection}
      />
    )
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <a href="#main" className="skip-link">{appCopy.skip}</a>
        <a className="brand" href="./" aria-label={appCopy.home}>
          <span className="brand-mark">
            {appCopy.brandMark}
            <span>{symbols.arrow}</span>
          </span>
          <span>
            {appCopy.brand}
            <span className="brand-second">
              {appCopy.brandSecond}
              <span className="brand-dot">{appCopy.brandDot}</span>
            </span>
          </span>
        </a>
        <div className="sidebar-label">{appCopy.learningSpace}</div>
        <nav aria-label={appCopy.navigation}>
          {sections.map(renderNavigation)}
        </nav>
        <div className="sidebar-note">
          <span className="seed-icon">{symbols.seed}</span>
          <strong>{appCopy.bigSystems}<br />{appCopy.smallSteps}</strong>
          <p>{appCopy.note}</p>
          <Badge>{appCopy.phase}</Badge>
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" />
          {appCopy.nextChapter}
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            {appCopy.journey}
            <span className="breadcrumb">
              {symbols.breadcrumb}{sections.find(isCurrentSection)?.label}
            </span>
          </span>
          <span className="topbar-right">
            <span className="status-dot" />
            {appCopy.track}
            <span className="avatar" aria-hidden="true">{appCopy.avatar}</span>
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          {section === 'learn' && <Learn onQuiz={startQuiz} onBuild={startBuilding} />}
          {section === 'quiz' && <Quiz key={quizTopic} initialTopic={quizTopic} />}
          {section === 'game' && <DesignGame />}
        </main>
        <footer className="page-footer">
          <span>{appCopy.footer}</span>
          <span>{topicFooter(topics.length)}</span>
        </footer>
      </div>
    </div>
  )
}
