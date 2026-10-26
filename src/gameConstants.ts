import type { ComponentType, Difficulty, FlowStep } from './types'

export const playgroundCopy = {
  canvas: 'Architecture canvas',
  placement: 'Drag library blocks onto the canvas, or click to add. Drag a node’s Move handle; focus it and use arrow keys to nudge. On touch devices, use Edit and the X/Y fields.',
  libraryHelp: 'Drag a block onto the canvas, or click to add it.',
  move: 'Move',
  tool: 'Technology',
  toolsHelp: 'Curated examples, not integrations or universal recommendations. Choose based on your workload and tradeoffs.',
  capacity: 'Illustrative capacity per replica (requests or jobs/sec)',
  shards: 'Database shards (1–128)',
  ttl: 'Cache TTL (seconds, 0–86400)',
  cachePolicy: 'Cache policy',
  cacheAside: 'Cache-aside',
  writeThrough: 'Write-through',
  stateless: 'Stateless application / worker',
  stateful: 'Stateful',
  statelessOption: 'Stateless',
  x: 'X position (0–10000)',
  y: 'Y position (0–10000)',
  invalid: 'Check the component name and numeric bounds before saving.',
  configurationHelp: 'Shards, TTL, and cache policy configure the architecture and validation; they do not model routing or cache hits in the trace.',
  flowTitle: 'Illustrative flow traversal',
  flowHelp: 'This directed breadth-first walkthrough is not a realistic traffic simulation or a performance promise. Each branch receives the same illustrative rate; capacity is replicas × configured capacity. Cycles are visited finitely.',
  entry: 'Flow entry component',
  noEntry: 'Add a component to trace a flow.',
  rate: 'Illustrative request / job rate per second',
  trace: 'Trace Flow',
  previous: 'Previous step',
  next: 'Next step',
  resetFlow: 'Reset trace',
  noSteps: 'No outgoing path from this entry. Add a directed connection or choose another source.',
  disconnected: 'Unreachable from this entry:',
  truncated: 'Traversal reached its safety limit. Some paths may not be shown.',
  overload: 'Illustrative overload: incoming rate exceeds configured target capacity.',
  withinCapacity: 'Within configured illustrative capacity.',
  unknown: 'Unavailable component',
  direction: 'Directed connections',
}

export const dragFormats = { library: 'application/x-quest-component-type', node: 'application/x-quest-node', offset: 'application/x-quest-offset' }
export const nodeSize = { width: 210, height: 140 }

export function taskDifficultyLabel(difficulty: Difficulty) {
  return `${difficulty.toUpperCase()} QUEST`
}

export function playgroundTaskOption(index: number, title: string, difficulty: Difficulty) {
  return `${String(index + 1).padStart(2, '0')} · ${difficulty} · ${title}`
}

export function moveLabel(name: string) {
  return `Move ${name}. Arrow keys move by 10 pixels; Shift moves by 50.`
}

export function edgeLabel(source: string, destination: string) {
  return `${source} → ${destination}`
}

export function flowStepLabel(index: number, total: number) {
  return `Step ${index + 1} of ${total}`
}

export function flowExplanation(step: FlowStep, source: string, destination: string) {
  return `${source} → ${destination}: ${step.rate} requests/jobs per second; target capacity ${step.capacity} per second.`
}

export function toolDetails(name: string) {
  return `Technology: ${name}`
}

export function isDatabase(type: ComponentType) {
  return type === 'SQL DB' || type === 'NoSQL DB'
}
