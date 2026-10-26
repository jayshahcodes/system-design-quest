import type { ComponentSettings, GameComponent, Position } from '../types.ts'

export function getSettings(component: GameComponent): Required<ComponentSettings> {
  return {
    technology: component.settings?.technology ?? 'generic',
    capacity: component.settings?.capacity ?? 100,
    shards: component.settings?.shards ?? 1,
    ttlSeconds: component.settings?.ttlSeconds ?? 300,
    cachePolicy: component.settings?.cachePolicy ?? 'cache-aside',
    stateless: component.settings?.stateless ?? true,
  }
}

export function getPosition(component: GameComponent, index: number): Position {
  return component.position ?? { x: 30 + (index % 3) * 250, y: 30 + Math.floor(index / 3) * 180 }
}
