import { componentTypes } from '../types.ts'
import type { Board } from '../types.ts'

export const storageKey = (taskId: string) => `system-design-quest:board:v1:${taskId}`
export const emptyBoard = (): Board => ({ components: [], connections: [] })
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

export function parseBoard(raw: string | null): Board {
  if (!raw) return emptyBoard()
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || !Array.isArray(value.components) || !Array.isArray(value.connections)) return emptyBoard()
    const ids = new Set<string>()
    for (const component of value.components) {
      if (!isRecord(component) || typeof component.id !== 'string' || !component.id || ids.has(component.id)
        || typeof component.name !== 'string' || !component.name.trim() || component.name.length > 80
        || !componentTypes.some((type) => type === component.type) || !Number.isInteger(component.replicas)
        || (component.replicas as number) < 1 || (component.replicas as number) > 100) return emptyBoard()
      ids.add(component.id)
    }
    const connectionIds = new Set<string>()
    const pairs = new Set<string>()
    for (const connection of value.connections) {
      if (!isRecord(connection) || typeof connection.id !== 'string' || !connection.id
        || connectionIds.has(connection.id) || typeof connection.from !== 'string' || typeof connection.to !== 'string'
        || !ids.has(connection.from) || !ids.has(connection.to) || connection.from === connection.to) return emptyBoard()
      const pair = JSON.stringify([connection.from, connection.to])
      if (pairs.has(pair)) return emptyBoard()
      connectionIds.add(connection.id)
      pairs.add(pair)
    }
    return value as unknown as Board
  } catch {
    return emptyBoard()
  }
}

export function loadBoard(taskId: string): Board {
  try {
    return parseBoard(localStorage.getItem(storageKey(taskId)))
  } catch {
    return emptyBoard()
  }
}

export function saveBoard(taskId: string, board: Board): boolean {
  try {
    localStorage.setItem(storageKey(taskId), JSON.stringify(board))
    return true
  } catch {
    return false
  }
}
