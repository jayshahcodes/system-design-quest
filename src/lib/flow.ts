import type { Board, FlowResult, FlowStep } from '../types.ts'
import { getSettings } from './architecture.ts'

export type { FlowResult, FlowStep } from '../types.ts'

export function traceFlow(board: Board, entryId: string, requestRate: number): FlowResult {
  const components = new Map(board.components.map((component) => [component.id, component]))
  const rate = Number.isFinite(requestRate) ? Math.min(100000, Math.max(1, requestRate)) : 1
  const reachable = new Set<string>()
  const steps: FlowStep[] = []
  if (!components.has(entryId)) return { steps, unreachable: [...components.keys()], truncated: false }
  const outgoing = new Map<string, typeof board.connections>()
  for (const connection of board.connections) {
    if (!components.has(connection.from) || !components.has(connection.to)) continue
    const edges = outgoing.get(connection.from) ?? []
    edges.push(connection)
    outgoing.set(connection.from, edges)
  }
  reachable.add(entryId)
  const pending = [{ id: entryId, depth: 0 }]
  const seenEdges = new Set<string>()
  let truncated = false
  for (let index = 0; index < pending.length; index++) {
    const current = pending[index]
    for (const edge of outgoing.get(current.id) ?? []) {
      if (seenEdges.has(edge.id)) continue
      seenEdges.add(edge.id)
      const target = components.get(edge.to)!
      const capacity = target.replicas * getSettings(target).capacity
      if (steps.length < 200) {
        steps.push({ id: edge.id, from: edge.from, to: edge.to, depth: current.depth + 1, rate, capacity, overloaded: rate > capacity })
      } else {
        truncated = true
      }
      // Reachability remains accurate even when the illustrative trace is capped.
      if (!reachable.has(edge.to)) {
        reachable.add(edge.to)
        pending.push({ id: edge.to, depth: current.depth + 1 })
      }
    }
  }
  return { steps, unreachable: [...components.keys()].filter((id) => !reachable.has(id)), truncated }
}
