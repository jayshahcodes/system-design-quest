import type { Board, ComponentType, GameComponent, TaskDefinition, TaskRule, ValidationResult } from '../types.ts'
import { requirementFeedback, validationCopy } from '../constants.ts'
import { getSettings } from './architecture.ts'

type ComponentRule = Extract<TaskRule, { kind: 'component' }>
const hasConfiguration = (rule: ComponentRule) => rule.minCapacity !== undefined || rule.minShards !== undefined
  || rule.cachePolicy !== undefined || rule.stateless !== undefined
const matchesConfiguration = (component: GameComponent, rule: ComponentRule) => {
  const settings = getSettings(component)
  return settings.capacity >= (rule.minCapacity ?? 1) && settings.shards >= (rule.minShards ?? 1)
    && (rule.cachePolicy === undefined || settings.cachePolicy === rule.cachePolicy)
    && (rule.stateless === undefined || settings.stateless === rule.stateless)
}

export function validateBoard(board: Board, task: TaskDefinition): ValidationResult {
  const requiredReplicas = (type: ComponentType) => Math.max(1, ...task.rules
    .filter((rule) => rule.kind === 'component' && rule.type === type)
    .map((rule) => rule.kind === 'component' ? rule.minReplicas ?? 1 : 1))
  const eligible = new Map(board.components
    .filter((component) => component.replicas >= requiredReplicas(component.type)
      && task.rules.every((rule) => rule.kind !== 'component' || rule.type !== component.type || matchesConfiguration(component, rule)))
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
      ? board.components.some((component) => component.type === rule.type && component.replicas >= (rule.minReplicas ?? 1)
        && matchesConfiguration(component, rule) && (!hasConfiguration(rule) || reachable.has(component.id)))
      : edges.some((connection) => reachable.has(connection.from)
        && eligible.get(connection.from)?.type === rule.from && eligible.get(connection.to)?.type === rule.to)
    return { label: rule.label, passed, feedback: passed ? validationCopy.met : requirementFeedback(rule.label, task.entryType) }
  })
  const score = checks.filter((check) => check.passed).length
  return { passed: score === checks.length, score, total: checks.length, checks }
}
