export interface Topic {
  id: string
  title: string
  summary: string
  minutes: number
  icon: string
  sections: { heading: string; body: string }[]
  example: string
  takeaway: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
  sources?: { title: string; url: string; publisher: string }[]
}

export interface QuizQuestion {
  id: string
  topicId: string
  kind: 'concept' | 'scenario'
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

export const componentTypes = ['Client', 'Load Balancer', 'App Server', 'Cache', 'SQL DB', 'Queue', 'NoSQL DB', 'Object Storage', 'CDN', 'Worker'] as const
export type ComponentType = (typeof componentTypes)[number]

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Position {
  x: number
  y: number
}

export interface ComponentSettings {
  technology?: string
  capacity?: number
  shards?: number
  ttlSeconds?: number
  cachePolicy?: 'cache-aside' | 'write-through'
  stateless?: boolean
}

export interface GameComponent {
  id: string
  name: string
  type: ComponentType
  replicas: number
  position?: Position
  settings?: ComponentSettings
}

export interface Connection {
  id: string
  from: string
  to: string
}

export interface Board {
  components: GameComponent[]
  connections: Connection[]
}

export type TaskRule =
  | { kind: 'component'; type: ComponentType; minReplicas?: number; minCapacity?: number; minShards?: number; cachePolicy?: ComponentSettings['cachePolicy']; stateless?: boolean; label: string }
  | { kind: 'connection'; from: ComponentType; to: ComponentType; label: string }

export interface TaskDefinition {
  id: string
  title: string
  difficulty: Difficulty
  entryType: ComponentType
  description: string
  hint: string
  rules: TaskRule[]
}

export interface ValidationResult {
  passed: boolean
  score: number
  total: number
  checks: { label: string; passed: boolean; feedback: string }[]
}

export interface FlowStep {
  id: string
  from: string
  to: string
  depth: number
  rate: number
  capacity: number
  overloaded: boolean
}

export interface FlowResult {
  steps: FlowStep[]
  unreachable: string[]
  truncated: boolean
}
