import type { ChangeEvent, FormEvent } from 'react'
import type { ComponentType, Connection, GameComponent, TaskDefinition, TaskRule, ValidationResult } from '../types'
import { componentTypes } from '../types'
import {
  addComponentLabel, componentDetails, componentIcons, deleteComponentLabel,
  editComponentLabel, gameCopy, removeConnectionLabel, symbols, validationScore, validationSummary,
} from '../constants'
import { Badge } from './shared/Badge'
import { Button } from './shared/Button'
import { InputField, SelectField } from './shared/Fields'
import { ComponentOptions, ComponentTypeOptions } from './shared/Options'

function renderRule(rule: TaskRule) {
  return <li key={rule.label}>{rule.label}</li>
}

export function TaskBrief({ task }: { task: TaskDefinition }) {
  return (
    <section className="task-brief panel">
      <div>
        <Badge>{gameCopy.easy}</Badge>
        <h2>{task.title}</h2>
        <p>{task.description}</p>
        <details>
          <summary>{gameCopy.hint}</summary>
          <p>{task.hint}</p>
        </details>
      </div>
      <div className="requirements">
        <strong>{gameCopy.mission}</strong>
        <ul>{task.rules.map(renderRule)}</ul>
      </div>
    </section>
  )
}

interface LibraryButtonProps {
  type: ComponentType
  onAdd: (type: ComponentType) => void
}

function LibraryButton({ type, onAdd }: LibraryButtonProps) {
  function add() {
    onAdd(type)
  }

  return (
    <Button className="library-button" onClick={add} aria-label={addComponentLabel(type)}>
      <span>{componentIcons[type]}</span>
      {type}
      <span className="ml-auto">{symbols.plus}</span>
    </Button>
  )
}

export function ComponentLibrary({ onAdd }: { onAdd: (type: ComponentType) => void }) {
  function renderType(type: ComponentType) {
    return <LibraryButton key={type} type={type} onAdd={onAdd} />
  }

  return (
    <aside className="panel library">
      <h2>{gameCopy.library}</h2>
      <p className="muted small">{gameCopy.addHelp}</p>
      {componentTypes.map(renderType)}
      <p className="muted small">{gameCopy.replicasHelp}</p>
    </aside>
  )
}

interface ComponentCardProps {
  component: GameComponent
  onEdit: (component: GameComponent) => void
  onRemove: (id: string) => void
}

export function ComponentCard({ component, onEdit, onRemove }: ComponentCardProps) {
  function edit() {
    onEdit({ ...component })
  }

  function remove() {
    onRemove(component.id)
  }

  return (
    <article className="component-card">
      <span className="component-symbol">{componentIcons[component.type]}</span>
      <h3>{component.name}</h3>
      <p>{componentDetails(component.type, component.replicas)}</p>
      <div>
        <Button variant="text" aria-label={editComponentLabel(component.name)} onClick={edit}>
          {gameCopy.edit}
        </Button>
        <Button variant="delete" aria-label={deleteComponentLabel(component.name)} onClick={remove}>
          {gameCopy.delete}
        </Button>
      </div>
    </article>
  )
}

interface ComponentEditorProps {
  component: GameComponent
  onChange: (component: GameComponent) => void
  onSave: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function ComponentEditor({ component, onChange, onSave, onCancel }: ComponentEditorProps) {
  function changeName(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...component, name: event.target.value })
  }

  function changeType(event: ChangeEvent<HTMLSelectElement>) {
    onChange({ ...component, type: event.target.value as ComponentType })
  }

  function changeReplicas(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...component, replicas: event.target.valueAsNumber })
  }

  return (
    <form className="edit-form" onSubmit={onSave}>
      <h3>{gameCopy.editComponent}</h3>
      <InputField
        id="component-name"
        label={gameCopy.name}
        maxLength={80}
        required
        value={component.name}
        onChange={changeName}
      />
      <SelectField id="component-type" label={gameCopy.type} value={component.type} onChange={changeType}>
        <ComponentTypeOptions />
      </SelectField>
      <InputField
        id="replicas"
        label={gameCopy.replicas}
        type="number"
        min={1}
        max={100}
        step={1}
        required
        value={Number.isNaN(component.replicas) ? '' : component.replicas}
        onChange={changeReplicas}
      />
      <div className="flex flex-wrap gap-3">
        <Button disabled={!component.name.trim()}>{gameCopy.save}</Button>
        <Button variant="secondary" type="button" onClick={onCancel}>{gameCopy.cancel}</Button>
      </div>
    </form>
  )
}

interface ConnectionRowProps {
  connection: Connection
  components: GameComponent[]
  onRemove: (id: string) => void
}

function ConnectionRow({ connection, components, onRemove }: ConnectionRowProps) {
  function isSource(component: GameComponent) {
    return component.id === connection.from
  }

  function isDestination(component: GameComponent) {
    return component.id === connection.to
  }

  function remove() {
    onRemove(connection.id)
  }

  const source = components.find(isSource)?.name
  const destination = components.find(isDestination)?.name

  return (
    <li>
      <span>
        {source}{symbols.space}<span className="muted">{symbols.right}</span>{symbols.space}{destination}
      </span>
      <Button variant="delete" aria-label={removeConnectionLabel(source, destination)} onClick={remove}>
        {gameCopy.remove}
      </Button>
    </li>
  )
}

interface ConnectionsProps {
  components: GameComponent[]
  connections: Connection[]
  from: string
  to: string
  onFrom: (id: string) => void
  onTo: (id: string) => void
  onConnect: (event: FormEvent<HTMLFormElement>) => void
  onRemove: (id: string) => void
}

export function Connections({ components, connections, from, to, onFrom, onTo, onConnect, onRemove }: ConnectionsProps) {
  function changeFrom(event: ChangeEvent<HTMLSelectElement>) {
    onFrom(event.target.value)
  }

  function changeTo(event: ChangeEvent<HTMLSelectElement>) {
    onTo(event.target.value)
  }

  function renderConnection(connection: Connection) {
    return <ConnectionRow key={connection.id} connection={connection} components={components} onRemove={onRemove} />
  }

  return (
    <section className="connections">
      <h3>{gameCopy.connections}<Badge variant="count-badge">{connections.length}</Badge></h3>
      <p className="muted small">{gameCopy.connectionsHelp}</p>
      <form className="connection-form" onSubmit={onConnect}>
        <div>
          <SelectField id="connection-from" label={gameCopy.from} value={from} onChange={changeFrom} required>
            <option value="">{gameCopy.source}</option>
            <ComponentOptions components={components} />
          </SelectField>
        </div>
        <span className="connection-arrow" aria-hidden="true">{symbols.right}</span>
        <div>
          <SelectField id="connection-to" label={gameCopy.to} value={to} onChange={changeTo} required>
            <option value="">{gameCopy.destination}</option>
            <ComponentOptions components={components} />
          </SelectField>
        </div>
        <Button variant="secondary" disabled={components.length < 2}>{gameCopy.connect}</Button>
      </form>
      {connections.length === 0 ? (
        <p className="muted small">{gameCopy.noConnections}</p>
      ) : (
        <ul className="connection-list">{connections.map(renderConnection)}</ul>
      )}
    </section>
  )
}

function renderCheck(check: ValidationResult['checks'][number]) {
  return (
    <li key={check.label}>
      <span aria-hidden="true">{check.passed ? symbols.check : symbols.circle}</span>
      <div>
        <strong>{check.label}</strong>
        <p>{check.feedback}</p>
      </div>
    </li>
  )
}

export function ValidationPanel({ result }: { result: ValidationResult }) {
  return (
    <section className={`panel validation ${result.passed ? 'passed' : ''}`} aria-live="polite">
      <div className="eyebrow">{result.passed ? gameCopy.complete : gameCopy.iterate}</div>
      <h2>{result.passed ? gameCopy.meetsMission : gameCopy.gaps}</h2>
      <p>
        <strong>{validationScore(result.score, result.total)}</strong>
        {validationSummary(result.passed)}
      </p>
      <ul>{result.checks.map(renderCheck)}</ul>
      <p className="muted small">{gameCopy.disclaimer}</p>
    </section>
  )
}
