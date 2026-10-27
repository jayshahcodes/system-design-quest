import { useId } from 'react'
import type { DragEvent, KeyboardEvent } from 'react'
import type { Board, ComponentType, Connection, FlowStep, GameComponent, Position } from '../types'
import { componentTypes } from '../types'
import { getPosition } from '../lib/architecture'
import { dragFormats, edgeLabel, moveLabel, nodeSize, playgroundCopy } from '../gameConstants'
import { ComponentCard } from './GameParts'
import { Button } from './shared/Button'

interface CanvasProps {
  board: Board
  activeStep: FlowStep | null
  onAdd: (type: ComponentType, position?: Position) => void
  onMove: (id: string, position: Position) => void
  onEdit: (component: GameComponent) => void
  onRemove: (id: string) => void
}

function bounded(value: number) {
  return Math.max(0, Math.min(10000, Math.round(value)))
}

interface NodeProps extends Pick<CanvasProps, 'onMove' | 'onEdit' | 'onRemove'> {
  component: GameComponent
  position: Position
  active: boolean
}

function CanvasNode({ component, position, active, onMove, onEdit, onRemove }: NodeProps) {
  function startDrag(event: DragEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.closest('article')!.getBoundingClientRect()
    event.dataTransfer.setData(dragFormats.node, component.id)
    event.dataTransfer.setData(dragFormats.offset, JSON.stringify({ x: event.clientX - rect.left, y: event.clientY - rect.top }))
    event.dataTransfer.effectAllowed = 'move'
  }

  function nudge(event: KeyboardEvent<HTMLButtonElement>) {
    const delta = event.shiftKey ? 50 : 10
    let { x, y } = position
    switch (event.key) {
      case 'ArrowLeft': x -= delta; break
      case 'ArrowRight': x += delta; break
      case 'ArrowUp': y -= delta; break
      case 'ArrowDown': y += delta; break
      default: return
    }
    event.preventDefault()
    onMove(component.id, { x: bounded(x), y: bounded(y) })
  }

  return (
    <article className={`canvas-node${active ? ' flow-node-active' : ''}`} style={{ left: position.x, top: position.y }}>
      <Button className="node-handle" variant="text" draggable onDragStart={startDrag} onKeyDown={nudge} aria-label={moveLabel(component.name)}>
        {playgroundCopy.move}
      </Button>
      <ComponentCard component={component} onEdit={onEdit} onRemove={onRemove} />
    </article>
  )
}

export function ArchitectureCanvas({ board, activeStep, onAdd, onMove, onEdit, onRemove }: CanvasProps) {
  const markerId = useId().replaceAll(':', '')
  let width = 1000
  let height = 600
  const positions = new Map<string, Position>()
  for (const [index, component] of board.components.entries()) {
    const position = getPosition(component, index)
    positions.set(component.id, position)
    width = Math.max(width, position.x + nodeSize.width + 60)
    height = Math.max(height, position.y + nodeSize.height + 60)
  }

  function allowDrop(event: DragEvent<HTMLDivElement>) {
    if (event.dataTransfer.types.includes(dragFormats.library) || event.dataTransfer.types.includes(dragFormats.node)) {
      event.preventDefault()
    }
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const rawType = event.dataTransfer.getData(dragFormats.library)
    function matchesType(type: ComponentType) { return type === rawType }
    const type = componentTypes.find(matchesType)
    if (type) {
      onAdd(type, { x: bounded(event.clientX - rect.left), y: bounded(event.clientY - rect.top) })
      return
    }
    const id = event.dataTransfer.getData(dragFormats.node)
    if (!positions.has(id)) return
    let offset: Position = { x: 0, y: 0 }
    try {
      const parsed: unknown = JSON.parse(event.dataTransfer.getData(dragFormats.offset))
      if (typeof parsed === 'object' && parsed !== null && 'x' in parsed && 'y' in parsed &&
        typeof parsed.x === 'number' && typeof parsed.y === 'number' && Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        offset = { x: parsed.x, y: parsed.y }
      }
    } catch { /* External or incomplete payloads use the node's top-left. */ }
    onMove(id, { x: bounded(event.clientX - rect.left - offset.x), y: bounded(event.clientY - rect.top - offset.y) })
  }

  function renderNode(component: GameComponent) {
    const position = positions.get(component.id)!
    return <CanvasNode key={component.id} component={component} position={position}
      active={activeStep?.from === component.id || activeStep?.to === component.id}
      onMove={onMove} onEdit={onEdit} onRemove={onRemove} />
  }

  function renderEdge(connection: Connection) {
    const source = positions.get(connection.from)
    const target = positions.get(connection.to)
    if (!source || !target) return null
    const dx = target.x - source.x
    const dy = target.y - source.y
    const scale = Math.max(Math.abs(dx) / (nodeSize.width / 2), Math.abs(dy) / (nodeSize.height / 2), 1)
    const sx = source.x + nodeSize.width / 2 + dx / scale
    const sy = source.y + nodeSize.height / 2 + dy / scale
    const tx = target.x + nodeSize.width / 2 - dx / scale
    const ty = target.y + nodeSize.height / 2 - dy / scale
    const length = Math.hypot(dx, dy) || 1
    const cx = (sx + tx) / 2 - dy / length * 28
    const cy = (sy + ty) / 2 + dx / length * 28
    function isSource(component: GameComponent) { return component.id === connection.from }
    function isTarget(component: GameComponent) { return component.id === connection.to }
    const label = edgeLabel(board.components.find(isSource)?.name ?? playgroundCopy.unknown, board.components.find(isTarget)?.name ?? playgroundCopy.unknown)
    const active = activeStep?.id === connection.id
    return (
      <g key={connection.id} className={active ? 'canvas-edge flow-edge-active' : 'canvas-edge'}>
        <title>{label}</title>
        <path d={`M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`} markerEnd={`url(#${markerId})`} />
        {active && <circle className="flow-pulse" cx={cx} cy={cy} r={5} />}
      </g>
    )
  }

  return (
    <section className="architecture-workspace" aria-label={playgroundCopy.canvas}>
      <p className="muted small">{playgroundCopy.placement}</p>
      <div className="canvas-scroll" tabIndex={0} aria-label={playgroundCopy.canvas}>
        <div className="canvas-surface" style={{ width, height }} onDragOver={allowDrop} onDrop={drop}>
          <svg className="canvas-edges" width={width} height={height} role="img" aria-label={playgroundCopy.direction}>
            <defs><marker id={markerId} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker></defs>
            {board.connections.map(renderEdge)}
          </svg>
          {board.components.map(renderNode)}
        </div>
      </div>
    </section>
  )
}
