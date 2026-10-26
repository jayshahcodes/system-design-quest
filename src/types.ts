export interface Topic {
  id: string
  title: string
  summary: string
  minutes: number
  icon: string
  sections: { heading: string; body: string }[]
  example: string
  takeaway: string
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

export const componentTypes = ['Client', 'Load Balancer', 'App Server', 'Cache', 'SQL DB', 'Queue'] as const
export type ComponentType = (typeof componentTypes)[number]

export interface GameComponent {
  id: string
  name: string
  type: ComponentType
  replicas: number
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
  | { kind: 'component'; type: ComponentType; minReplicas?: number; label: string }
  | { kind: 'connection'; from: ComponentType; to: ComponentType; label: string }

export interface TaskDefinition {
  id: string
  title: string
  difficulty: 'Easy'
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
