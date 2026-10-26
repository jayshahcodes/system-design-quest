import { useState } from 'react'
import { tasks } from '../data/tasks'
import { componentTypes } from '../types'
import type { Board, ComponentType, GameComponent, ValidationResult } from '../types'
import { emptyBoard, loadBoard, saveBoard } from '../lib/storage'
import { validateBoard } from '../lib/validation'

const icons: Record<ComponentType, string> = { Client: '▣', 'Load Balancer': '⑂', 'App Server': '▤', Cache: 'ϟ', 'SQL DB': '▱', Queue: '≋' }

export function DesignGame() {
  const [taskId, setTaskId] = useState(tasks[0].id)
  return <GameBoard key={taskId} taskId={taskId} onTask={setTaskId} />
}

function GameBoard({ taskId, onTask }: { taskId: string; onTask: (id: string) => void }) {
  const task = tasks.find((item) => item.id === taskId)!
  const [board, setBoard] = useState<Board>(() => loadBoard(taskId))
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [editing, setEditing] = useState<GameComponent | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  function update(next: Board) {
    setBoard(next)
    setResult(null)
    setStorageError(!saveBoard(taskId, next))
  }

  function add(type: ComponentType) {
    update({ ...board, components: [...board.components, { id: crypto.randomUUID(), name: `${type} ${board.components.filter((component) => component.type === type).length + 1}`, type, replicas: 1 }] })
    setMessage(`${type} added to your board.`)
  }

  function remove(id: string) {
    update({ components: board.components.filter((component) => component.id !== id), connections: board.connections.filter((connection) => connection.from !== id && connection.to !== id) })
    if (editing?.id === id) setEditing(null)
    if (from === id) setFrom('')
    if (to === id) setTo('')
    setMessage('Component and its connections removed.')
  }

  return (
    <div className="page-content">
      <div className="eyebrow">YOUR ARCHITECTURE PLAYGROUND</div><h1>Connect ideas. <span>Build a system.</span></h1><p className="page-intro">Choose a quest, assemble the pieces, and see how your design measures up.</p>
      <label htmlFor="task">Choose your task</label><select id="task" className="task-select" value={taskId} onChange={(event) => onTask(event.target.value)}>{tasks.map((item, index) => <option key={item.id} value={item.id}>0{index + 1} · {item.title}</option>)}</select>
      <section className="task-brief panel"><div><span className="badge">EASY QUEST</span><h2>{task.title}</h2><p>{task.description}</p><details><summary>Need a hint?</summary><p>{task.hint}</p></details></div><div className="requirements"><strong>Your mission</strong><ul>{task.rules.map((rule) => <li key={rule.label}>{rule.label}</li>)}</ul></div></section>
      {storageError && <p className="warning" role="alert">Your browser could not save this board. You can keep playing, but changes may be lost on reload.</p>}
      <div className="game-layout">
        <aside className="panel library"><h2>Component library</h2><p className="muted small">Add Component · Click a block to add it.</p>{componentTypes.map((type) => <button key={type} className="library-button" onClick={() => add(type)} aria-label={`Add Component: ${type}`}><span>{icons[type]}</span>{type}<span className="ml-auto">+</span></button>)}<p className="muted small">Replicas are instances of a component. Edit a block to configure them.</p></aside>
        <section className="panel board"><div className="board-header"><h2>Your architecture <span className="count-badge">{board.components.length}</span></h2><span className="muted small">Directed request flow</span></div>
          {board.components.length === 0 ? <div className="empty-state"><span>⌘</span><h3>A blank canvas. A fresh possibility.</h3><p>Add a component from the library to start your design.</p><button className="secondary-button" onClick={() => add('Client')}>Add Component: Client +</button></div> : <div className="board-grid">{board.components.map((component) => <article className="component-card" key={component.id}><span className="component-symbol">{icons[component.type]}</span><h3>{component.name}</h3><p>{component.type} · {component.replicas} {component.replicas === 1 ? 'replica' : 'replicas'}</p><div><button className="text-button" aria-label={`Edit ${component.name}`} onClick={() => setEditing({ ...component })}>Edit</button><button className="delete-button" aria-label={`Delete ${component.name}`} onClick={() => remove(component.id)}>Delete</button></div></article>)}</div>}
          {editing && <form className="edit-form" onSubmit={(event) => { event.preventDefault(); update({ ...board, components: board.components.map((component) => component.id === editing.id ? { ...editing, name: editing.name.trim() } : component) }); setEditing(null); setMessage('Component updated.') }}><h3>Edit component</h3><label htmlFor="component-name">Name</label><input id="component-name" maxLength={80} required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /><label htmlFor="component-type">Type</label><select id="component-type" value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value as ComponentType })}>{componentTypes.map((type) => <option key={type}>{type}</option>)}</select><label htmlFor="replicas">Replicas (1–100)</label><input id="replicas" type="number" min={1} max={100} step={1} required value={Number.isNaN(editing.replicas) ? '' : editing.replicas} onChange={(event) => setEditing({ ...editing, replicas: event.target.valueAsNumber })} /><div className="flex flex-wrap gap-3"><button className="primary-button" disabled={!editing.name.trim()}>Save component</button><button className="secondary-button" type="button" onClick={() => setEditing(null)}>Cancel</button></div></form>}
          <section className="connections"><h3>Connections <span className="count-badge">{board.connections.length}</span></h3><p className="muted small">Point each connection from the requester to the receiving component.</p><form className="connection-form" onSubmit={(event) => { event.preventDefault(); if (!from || !to || from === to) { setMessage('Choose two different components.'); return } if (board.connections.some((connection) => connection.from === from && connection.to === to)) { setMessage('That connection already exists.'); return } update({ ...board, connections: [...board.connections, { id: crypto.randomUUID(), from, to }] }); setMessage('Connection added.') }}><div><label htmlFor="connection-from">From</label><select id="connection-from" value={from} onChange={(event) => setFrom(event.target.value)} required><option value="">Select source</option>{board.components.map((component) => <option key={component.id} value={component.id}>{component.name}</option>)}</select></div><span className="connection-arrow" aria-hidden="true">→</span><div><label htmlFor="connection-to">To</label><select id="connection-to" value={to} onChange={(event) => setTo(event.target.value)} required><option value="">Select destination</option>{board.components.map((component) => <option key={component.id} value={component.id}>{component.name}</option>)}</select></div><button className="secondary-button" disabled={board.components.length < 2}>Connect +</button></form>{board.connections.length === 0 ? <p className="muted small">No connections yet. Add two components, then connect them above.</p> : <ul className="connection-list">{board.connections.map((connection) => <li key={connection.id}><span>{board.components.find((component) => component.id === connection.from)?.name} <span className="muted">→</span> {board.components.find((component) => component.id === connection.to)?.name}</span><button className="delete-button" aria-label={`Remove connection ${board.components.find((component) => component.id === connection.from)?.name} to ${board.components.find((component) => component.id === connection.to)?.name}`} onClick={() => { update({ ...board, connections: board.connections.filter((item) => item.id !== connection.id) }); setMessage('Connection removed.') }}>Remove</button></li>)}</ul>}</section>
        </section>
      </div>
      <div className="game-actions"><button className="primary-button" onClick={() => { setResult(validateBoard(board, task)); setMessage('Validation complete. See your results below.') }}>Run Validation ↗</button><button className="secondary-button" onClick={() => setConfirmReset(true)}>Reset Task</button><span className="muted small">{storageError ? 'Changes not saved' : 'Board saved locally as you build'}</span></div>
      {confirmReset && <div className="reset-confirm panel" role="alert"><p>Clear all components and connections for this task? Other tasks are kept.</p><button className="primary-button" onClick={() => { update(emptyBoard()); setEditing(null); setFrom(''); setTo(''); setConfirmReset(false); setMessage('Task reset. Start a fresh design.') }}>Confirm reset</button><button className="text-button" onClick={() => setConfirmReset(false)}>Keep building</button></div>}
      <p className="muted small" role="status">{message}</p>
      {result && <section className={`panel validation ${result.passed ? 'passed' : ''}`} aria-live="polite"><div className="eyebrow">{result.passed ? 'QUEST COMPLETE' : 'KEEP ITERATING'}</div><h2>{result.passed ? 'Your design meets the mission.' : 'Good start. Let’s fill in the gaps.'}</h2><p><strong>{result.score} / {result.total}</strong> requirements met · {result.passed ? 'PASS' : 'NOT YET'}</p><ul>{result.checks.map((check) => <li key={check.label}><span aria-hidden="true">{check.passed ? '✓' : '○'}</span><div><strong>{check.label}</strong><p>{check.feedback}</p></div></li>)}</ul><p className="muted small">This is a structural check, not a traffic simulation or production-readiness assessment.</p></section>}
    </div>
  )
}
