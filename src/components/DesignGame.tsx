import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { tasks } from '../data/tasks'
import type { Board, ComponentType, Connection, GameComponent, TaskDefinition, ValidationResult } from '../types'
import { emptyBoard, loadBoard, saveBoard } from '../lib/storage'
import { validateBoard } from '../lib/validation'
import { componentAdded, componentName, gameCopy, symbols, taskOption } from '../constants'
import { ComponentCard, ComponentEditor, ComponentLibrary, Connections, TaskBrief, ValidationPanel } from './GameParts'
import { Badge } from './shared/Badge'
import { Button } from './shared/Button'
import { SelectField } from './shared/Fields'
import { PageHeader } from './shared/PageHeader'

export function DesignGame() {
  const [taskId, setTaskId] = useState(tasks[0].id)
  return <GameBoard key={taskId} taskId={taskId} onTask={setTaskId} />
}

function renderTask(task: TaskDefinition, index: number) {
  return <option key={task.id} value={task.id}>{taskOption(index, task.title)}</option>
}

function GameBoard({ taskId, onTask }: { taskId: string; onTask: (id: string) => void }) {
  function isCurrentTask(item: TaskDefinition) {
    return item.id === taskId
  }

  function initialBoard() {
    return loadBoard(taskId)
  }

  const task = tasks.find(isCurrentTask)!
  const [board, setBoard] = useState<Board>(initialBoard)
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
    function hasType(component: GameComponent) {
      return component.type === type
    }

    update({
      ...board,
      components: [...board.components, {
        id: crypto.randomUUID(),
        name: componentName(type, board.components.filter(hasType).length + 1),
        type,
        replicas: 1,
      }],
    })
    setMessage(componentAdded(type))
  }

  function addClient() {
    add('Client')
  }

  function remove(id: string) {
    function keepComponent(component: GameComponent) {
      return component.id !== id
    }

    function keepConnection(connection: Connection) {
      return connection.from !== id && connection.to !== id
    }

    update({
      components: board.components.filter(keepComponent),
      connections: board.connections.filter(keepConnection),
    })
    if (editing?.id === id) setEditing(null)
    if (from === id) setFrom('')
    if (to === id) setTo('')
    setMessage(gameCopy.removed)
  }

  function changeTask(event: ChangeEvent<HTMLSelectElement>) {
    onTask(event.target.value)
  }

  function cancelEditing() {
    setEditing(null)
  }

  function saveComponent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    const edited = editing

    function replaceEdited(component: GameComponent) {
      return component.id === edited.id ? { ...edited, name: edited.name.trim() } : component
    }

    update({ ...board, components: board.components.map(replaceEdited) })
    setEditing(null)
    setMessage(gameCopy.updated)
  }

  function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!from || !to || from === to) {
      setMessage(gameCopy.differentComponents)
      return
    }

    function isDuplicate(connection: Connection) {
      return connection.from === from && connection.to === to
    }

    if (board.connections.some(isDuplicate)) {
      setMessage(gameCopy.duplicateConnection)
      return
    }
    update({ ...board, connections: [...board.connections, { id: crypto.randomUUID(), from, to }] })
    setMessage(gameCopy.connected)
  }

  function removeConnection(id: string) {
    function keepConnection(connection: Connection) {
      return connection.id !== id
    }

    update({ ...board, connections: board.connections.filter(keepConnection) })
    setMessage(gameCopy.disconnected)
  }

  function validate() {
    setResult(validateBoard(board, task))
    setMessage(gameCopy.validated)
  }

  function requestReset() {
    setConfirmReset(true)
  }

  function cancelReset() {
    setConfirmReset(false)
  }

  function reset() {
    update(emptyBoard())
    setEditing(null)
    setFrom('')
    setTo('')
    setConfirmReset(false)
    setMessage(gameCopy.taskReset)
  }

  function renderComponent(component: GameComponent) {
    return <ComponentCard key={component.id} component={component} onEdit={setEditing} onRemove={remove} />
  }

  return (
    <div className="page-content">
      <PageHeader
        eyebrow={gameCopy.eyebrow}
        title={<>{gameCopy.title}<span>{gameCopy.titleAccent}</span></>}
        intro={gameCopy.intro}
      />
      <SelectField id="task" label={gameCopy.chooseTask} className="task-select" value={taskId} onChange={changeTask}>
        {tasks.map(renderTask)}
      </SelectField>
      <TaskBrief task={task} />
      {storageError && <p className="warning" role="alert">{gameCopy.storageWarning}</p>}
      <div className="game-layout">
        <ComponentLibrary onAdd={add} />
        <section className="panel board">
          <div className="board-header">
            <h2>{gameCopy.architecture}<Badge variant="count-badge">{board.components.length}</Badge></h2>
            <span className="muted small">{gameCopy.flow}</span>
          </div>
          {board.components.length === 0 ? (
            <div className="empty-state">
              <span>{symbols.game}</span>
              <h3>{gameCopy.blank}</h3>
              <p>{gameCopy.addPrompt}</p>
              <Button variant="secondary" onClick={addClient}>{gameCopy.addClient}</Button>
            </div>
          ) : (
            <div className="board-grid">{board.components.map(renderComponent)}</div>
          )}
          {editing && (
            <ComponentEditor component={editing} onChange={setEditing} onSave={saveComponent} onCancel={cancelEditing} />
          )}
          <Connections
            components={board.components}
            connections={board.connections}
            from={from}
            to={to}
            onFrom={setFrom}
            onTo={setTo}
            onConnect={connect}
            onRemove={removeConnection}
          />
        </section>
      </div>
      <div className="game-actions">
        <Button onClick={validate}>{gameCopy.validate}</Button>
        <Button variant="secondary" onClick={requestReset}>{gameCopy.reset}</Button>
        <span className="muted small">{storageError ? gameCopy.unsaved : gameCopy.saved}</span>
      </div>
      {confirmReset && (
        <div className="reset-confirm panel" role="alert">
          <p>{gameCopy.resetPrompt}</p>
          <Button onClick={reset}>{gameCopy.confirmReset}</Button>
          <Button variant="text" onClick={cancelReset}>{gameCopy.keepBuilding}</Button>
        </div>
      )}
      <p className="muted small" role="status">{message}</p>
      {result && <ValidationPanel result={result} />}
    </div>
  )
}
