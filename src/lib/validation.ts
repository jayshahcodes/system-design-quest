import type { Board, ComponentType, TaskDefinition, ValidationResult } from '../types.ts'

export function validateBoard(board: Board, task: TaskDefinition): ValidationResult {
  const requiredReplicas = (type: ComponentType) => Math.max(1, ...task.rules
    .filter((rule) => rule.kind === 'component' && rule.type === type)
    .map((rule) => rule.kind === 'component' ? rule.minReplicas ?? 1 : 1))
  const eligible = new Map(board.components
    .filter((component) => component.replicas >= requiredReplicas(component.type))
    .map((component) => [component.id, component]))
  const edges = board.connections.filter((connection) => {
    const from = eligible.get(connection.from)
    const to = eligible.get(connection.to)
    return from && to && task.rules.some((rule) =>
      rule.kind === 'connection' && rule.from === from.type && rule.to === to.type)
  })
  const reachable = new Set([...eligible.values()]
    .filter((component) => component.type === task.entryType).map((component) => component.id))
  const pending = [...reachable]
  for (let index = 0; index < pending.length; index++) {
    for (const connection of edges) {
      if (connection.from === pending[index] && !reachable.has(connection.to)) {
        reachable.add(connection.to)
        pending.push(connection.to)
      }
    }
  }
  const checks = task.rules.map((rule) => {
    const passed = rule.kind === 'component'
      ? board.components.some((component) => component.type === rule.type && component.replicas >= (rule.minReplicas ?? 1))
      : edges.some((connection) => reachable.has(connection.from)
        && eligible.get(connection.from)?.type === rule.from && eligible.get(connection.to)?.type === rule.to)
    return { label: rule.label, passed, feedback: passed ? 'Requirement met.' : `${rule.label}. Add or edit the relevant components and directed connections; keep them reachable from a ${task.entryType}.` }
  })
  const score = checks.filter((check) => check.passed).length
  return { passed: score === checks.length, score, total: checks.length, checks }
}
