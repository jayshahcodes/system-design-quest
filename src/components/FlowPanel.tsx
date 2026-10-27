import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Board, ComponentType, FlowResult, FlowStep, GameComponent } from '../types'
import { flowExplanation, flowStepLabel, playgroundCopy } from '../gameConstants'
import { Button } from './shared/Button'
import { InputField, SelectField } from './shared/Fields'
import { ComponentOptions } from './shared/Options'

interface FlowPanelProps {
  board: Board
  entryType: ComponentType
  result: FlowResult | null
  activeIndex: number
  onTrace: (entryId: string, rate: number) => void
  onStep: (index: number) => void
  onReset: () => void
}

export function FlowPanel({ board, entryType, result, activeIndex, onTrace, onStep, onReset }: FlowPanelProps) {
  const [source, setSource] = useState('')
  const [rate, setRate] = useState(100)
  function isSelected(component: GameComponent) { return component.id === source }
  function isEntry(component: GameComponent) { return component.type === entryType }
  const entryId = board.components.find(isSelected)?.id ?? board.components.find(isEntry)?.id ?? board.components[0]?.id ?? ''
  const active = result?.steps[activeIndex]

  function changeSource(event: ChangeEvent<HTMLSelectElement>) {
    setSource(event.target.value)
    onReset()
  }
  function changeRate(event: ChangeEvent<HTMLInputElement>) {
    setRate(event.target.valueAsNumber)
    onReset()
  }
  function trace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (entryId && Number.isInteger(rate) && rate >= 1 && rate <= 100000) onTrace(entryId, rate)
  }
  function previous() { onStep(Math.max(0, activeIndex - 1)) }
  function next() { onStep(Math.min((result?.steps.length ?? 1) - 1, activeIndex + 1)) }
  function componentName(id: string) {
    function matches(component: GameComponent) { return component.id === id }
    return board.components.find(matches)?.name ?? playgroundCopy.unknown
  }
  function renderStep(step: FlowStep, index: number) {
    return (
      <li key={step.id} className={index === activeIndex ? 'flow-step-current' : undefined} aria-current={index === activeIndex ? 'step' : undefined}>
        {flowExplanation(step, componentName(step.from), componentName(step.to))}
        {step.overloaded && <strong className="warning">{playgroundCopy.overload}</strong>}
      </li>
    )
  }
  function renderUnreachable(id: string) { return <li key={id}>{componentName(id)}</li> }

  return (
    <section className="flow-panel panel">
      <h2>{playgroundCopy.flowTitle}</h2>
      <p className="muted small">{playgroundCopy.flowHelp}</p>
      <form className="flow-controls" onSubmit={trace}>
        <div>
          <SelectField id="flow-entry" label={playgroundCopy.entry} value={entryId} onChange={changeSource} disabled={!entryId} required>
            {!entryId && <option value="">{playgroundCopy.noEntry}</option>}
            <ComponentOptions components={board.components} />
          </SelectField>
        </div>
        <div>
          <InputField id="flow-rate" label={playgroundCopy.rate} type="number" min={1} max={100000} step={1}
            required value={Number.isNaN(rate) ? '' : rate} onChange={changeRate} />
        </div>
        <Button disabled={!entryId}>{playgroundCopy.trace}</Button>
      </form>
      {result && (
        <div className="flow-results">
          <div className="flow-navigation">
            <Button variant="secondary" onClick={previous} disabled={!active || activeIndex === 0}>{playgroundCopy.previous}</Button>
            <Button variant="secondary" onClick={next} disabled={!active || activeIndex >= result.steps.length - 1}>{playgroundCopy.next}</Button>
            <Button variant="text" onClick={onReset}>{playgroundCopy.resetFlow}</Button>
          </div>
          <div role="status" aria-live="polite" className="flow-current">
            {active ? <><strong>{flowStepLabel(activeIndex, result.steps.length)}</strong>
              <p>{flowExplanation(active, componentName(active.from), componentName(active.to))}</p>
              <p className={active.overloaded ? 'warning' : 'muted small'}>{active.overloaded ? playgroundCopy.overload : playgroundCopy.withinCapacity}</p></>
              : <p>{playgroundCopy.noSteps}</p>}
          </div>
          <ol className="flow-steps">{result.steps.map(renderStep)}</ol>
          {result.unreachable.length > 0 && <div><strong>{playgroundCopy.disconnected}</strong><ul>{result.unreachable.map(renderUnreachable)}</ul></div>}
          {result.truncated && <p className="warning">{playgroundCopy.truncated}</p>}
        </div>
      )}
    </section>
  )
}
