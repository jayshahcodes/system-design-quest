import { componentTypes } from '../types.ts'
import type { Board, ComponentSettings, ComponentType, GameComponent } from '../types.ts'
import { technologies } from '../data/technologies.ts'

export const storageKey = (taskId: string) => `system-design-quest:board:v1:${taskId}`
export const emptyBoard = (): Board => ({ components: [], connections: [] })
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

export function parseBoard(raw: string | null): Board {
  if (!raw) return emptyBoard()
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || !Array.isArray(value.components) || !Array.isArray(value.connections)) return emptyBoard()
    const ids = new Set<string>()
    const components: GameComponent[] = []
    for (const component of value.components) {
      if (!isRecord(component) || typeof component.id !== 'string' || !component.id || ids.has(component.id)
        || typeof component.name !== 'string' || !component.name.trim() || component.name.length > 80
        || !componentTypes.some((type) => type === component.type) || !Number.isInteger(component.replicas)
        || (component.replicas as number) < 1 || (component.replicas as number) > 100) return emptyBoard()
      ids.add(component.id)
      const parsed: GameComponent = {
        id: component.id, name: component.name, type: component.type as ComponentType, replicas: component.replicas as number,
      }
      if ('position' in component) {
        const position = component.position
        if (!isRecord(position) || typeof position.x !== 'number' || typeof position.y !== 'number'
          || !Number.isFinite(position.x) || !Number.isFinite(position.y)
          || position.x < 0 || position.y < 0 || position.x > 10000 || position.y > 10000) return emptyBoard()
        parsed.position = { x: position.x, y: position.y }
      }
      if ('settings' in component) {
        const settings = component.settings
        if (!isRecord(settings) || Array.isArray(settings)) return emptyBoard()
        const sanitized: ComponentSettings = {}
        if ('technology' in settings) {
          if (typeof settings.technology !== 'string' || !technologies.some((technology) =>
            technology.id === settings.technology && technology.types.includes(parsed.type))) return emptyBoard()
          sanitized.technology = settings.technology
        }
        for (const [key, minimum, maximum] of [
          ['capacity', 1, 100000], ['shards', 1, 128], ['ttlSeconds', 0, 86400],
        ] as const) {
          if (!(key in settings)) continue
          const number = settings[key]
          if (typeof number !== 'number' || !Number.isFinite(number) || number < minimum || number > maximum
            || (key !== 'capacity' && !Number.isInteger(number))) return emptyBoard()
          sanitized[key] = number
        }
        if ('cachePolicy' in settings) {
          if (settings.cachePolicy !== 'cache-aside' && settings.cachePolicy !== 'write-through') return emptyBoard()
          sanitized.cachePolicy = settings.cachePolicy
        }
        if ('stateless' in settings) {
          if (typeof settings.stateless !== 'boolean') return emptyBoard()
          sanitized.stateless = settings.stateless
        }
        parsed.settings = sanitized
      }
      components.push(parsed)
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
    return {
      components,
      connections: value.connections.map((connection: Record<string, string>) => ({
        id: connection.id, from: connection.from, to: connection.to,
      })),
    }
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
