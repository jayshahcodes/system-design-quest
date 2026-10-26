import assert from 'node:assert/strict'
import { test } from 'node:test'
import { tasks } from '../src/data/tasks.ts'
import { technologies, getTechnologies, getTechnology } from '../src/data/technologies.ts'
import { getPosition, getSettings } from '../src/lib/architecture.ts'
import { traceFlow } from '../src/lib/flow.ts'
import { emptyBoard, parseBoard, storageKey } from '../src/lib/storage.ts'
import { validateBoard } from '../src/lib/validation.ts'
import { componentTypes } from '../src/types.ts'
import type { Board, ComponentSettings, ComponentType, GameComponent, TaskDefinition } from '../src/types.ts'

const component = (id: string, type: ComponentType = 'App Server', settings?: ComponentSettings): GameComponent => ({
  id, type, name: id, replicas: 1, ...(settings ? { settings } : {}),
})
const edge = (from: string, to: string) => ({ id: `${from}-${to}`, from, to })

function solution(task: TaskDefinition): Board {
  const components = task.rules.flatMap((rule) => rule.kind === 'component' ? [{
    ...component(rule.type, rule.type, {
      capacity: rule.minCapacity ?? 100, shards: rule.minShards ?? 1,
      cachePolicy: rule.cachePolicy ?? 'cache-aside', stateless: rule.stateless ?? true,
    }),
    replicas: rule.minReplicas ?? 1,
  }] : [])
  return {
    components,
    connections: task.rules.flatMap((rule) => rule.kind === 'connection' ? [edge(rule.from, rule.to)] : []),
  }
}

test('settings and grid positions support legacy boards without mutating them', () => {
  const legacy = component('legacy')
  assert.deepEqual(getSettings(legacy), {
    technology: 'generic', capacity: 100, shards: 1, ttlSeconds: 300, cachePolicy: 'cache-aside', stateless: true,
  })
  assert.deepEqual(getPosition(legacy, 0), { x: 30, y: 30 })
  assert.deepEqual(getPosition(legacy, 2), { x: 530, y: 30 })
  assert.deepEqual(getPosition(legacy, 3), { x: 30, y: 210 })
  const configured = { ...legacy, position: { x: 42, y: 81 }, settings: { ttlSeconds: 0, stateless: false } }
  assert.deepEqual(getPosition(configured, 7), configured.position)
  assert.equal(getSettings(configured).ttlSeconds, 0)
  assert.equal(getSettings(configured).stateless, false)
  assert.equal('settings' in legacy, false)
  assert.equal('position' in legacy, false)
})

test('technology choices cover every type and incompatible selections fall back to generic', () => {
  assert.equal(new Set(technologies.map((technology) => technology.id)).size, technologies.length)
  for (const type of componentTypes) {
    assert.ok(getTechnologies(type).some((technology) => technology.id === 'generic'))
    assert.ok(getTechnologies(type).every((technology) => technology.types.includes(type)))
  }
  assert.equal(getTechnology(component('db', 'SQL DB', { technology: 'postgresql' })).id, 'postgresql')
  for (const technology of ['missing', 'redis']) {
    assert.equal(getTechnology(component('db', 'SQL DB', { technology })).id, 'generic')
  }
  assert.equal(getTechnology(component('old')).id, 'generic')
})

test('v1 boards retain exact legacy shapes and extended boards round-trip', () => {
  assert.equal(storageKey('old'), 'system-design-quest:board:v1:old')
  const legacy: Board = { components: [component('client', 'Client'), component('app')], connections: [edge('client', 'app')] }
  assert.deepEqual(parseBoard(JSON.stringify(legacy)), legacy)
  assert.equal('settings' in parseBoard(JSON.stringify(legacy)).components[0], false)
  const extended: Board = {
    components: [{ ...component('cache', 'Cache', {
      technology: 'redis', capacity: 100000, shards: 128, ttlSeconds: 0,
      cachePolicy: 'write-through', stateless: false,
    }), position: { x: 10000, y: 0 } }],
    connections: [],
  }
  assert.deepEqual(parseBoard(JSON.stringify(extended)), extended)
  const emptySettings = { components: [{ ...component('a'), settings: {} }], connections: [] }
  assert.deepEqual(parseBoard(JSON.stringify(emptySettings)), emptySettings)
})

test('storage sanitizes unknown properties instead of retaining untrusted board data', () => {
  const value = {
    components: [{ ...component('a'), unwanted: 1, settings: { capacity: 200, extra: 'discard' }, position: { x: 1, y: 2, extra: true } }, component('b')],
    connections: [{ ...edge('a', 'b'), unknown: true }], unknown: true,
  }
  assert.deepEqual(parseBoard(JSON.stringify(value)), {
    components: [{ ...component('a'), settings: { capacity: 200 }, position: { x: 1, y: 2 } }, component('b')],
    connections: [edge('a', 'b')],
  })
})

test('corrupt optional settings reject the whole board', () => {
  const badSettings = [
    null, [], 'wrong', { technology: 'missing' }, { technology: 'redis' },
    ...[0, -1, 100001, '100', null].map((capacity) => ({ capacity })),
    ...[0, 129, 1.5, '2', null].map((shards) => ({ shards })),
    ...[-1, 86401, 1.5, '2', null].map((ttlSeconds) => ({ ttlSeconds })),
    { cachePolicy: 'other' }, { cachePolicy: null }, { stateless: 'true' }, { stateless: null },
  ]
  for (const settings of badSettings) {
    assert.deepEqual(parseBoard(JSON.stringify({
      components: [{ ...component('a'), settings }, component('b')], connections: [edge('a', 'b')],
    })), emptyBoard(), JSON.stringify(settings))
  }
})

test('position coordinates must be finite numbers within the supported canvas bounds', () => {
  for (const position of [null, [], 'bad', {}, { x: -1, y: 0 }, { x: 0, y: 10001 }, { x: '0', y: 0 }, { x: 0 }]) {
    assert.deepEqual(parseBoard(JSON.stringify({
      components: [{ ...component('a'), position }], connections: [],
    })), emptyBoard())
  }
  assert.deepEqual(parseBoard('{"components":[{"id":"a","name":"a","type":"Cache","replicas":1,"settings":{"capacity":1e400}}],"connections":[]}'), emptyBoard())
  assert.deepEqual(parseBoard('{"components":[{"id":"a","name":"a","type":"Cache","replicas":1,"position":{"x":1e400,"y":0}}],"connections":[]}'), emptyBoard())
})

test('quests preserve the first three easy IDs and provide solvable medium and hard architectures', () => {
  assert.deepEqual(tasks.slice(0, 3).map((task) => [task.id, task.difficulty]), [
    ['static-site', 'Easy'], ['ten-k', 'Easy'], ['shortener', 'Easy'],
  ])
  assert.ok(tasks.filter((task) => task.difficulty === 'Medium').length >= 2)
  assert.ok(tasks.filter((task) => task.difficulty === 'Hard').length >= 2)
  assert.equal(new Set(tasks.map((task) => task.id)).size, tasks.length)
  for (const task of tasks) {
    const valid = solution(task)
    assert.equal(validateBoard(valid, task).passed, true, task.id)
    assert.deepEqual(parseBoard(JSON.stringify(valid)), valid)
    assert.equal(validateBoard(emptyBoard(), task).score, 0)
  }
})

test('each configuration rule fails on insufficient connected settings, even with a valid disconnected copy', () => {
  for (const task of tasks.slice(3)) {
    for (const rule of task.rules) {
      if (rule.kind !== 'component') continue
      const mutations: ComponentSettings[] = []
      if (rule.minCapacity !== undefined) mutations.push({ capacity: rule.minCapacity - 1 })
      if (rule.minShards !== undefined) mutations.push({ shards: rule.minShards - 1 })
      if (rule.cachePolicy !== undefined) mutations.push({ cachePolicy: rule.cachePolicy === 'cache-aside' ? 'write-through' : 'cache-aside' })
      if (rule.stateless !== undefined) mutations.push({ stateless: !rule.stateless })
      for (const mutation of mutations) {
        const board = solution(task)
        const target = board.components.find((node) => node.type === rule.type)!
        board.components.push({ ...target, id: 'disconnected' })
        target.settings = { ...target.settings, ...mutation }
        const result = validateBoard(board, task)
        assert.equal(result.passed, false, `${task.id}: ${JSON.stringify(mutation)}`)
        assert.equal(result.checks.find((check) => check.label === rule.label)?.passed, false)
      }
    }
  }
})

test('configured nodes require directed, rule-approved reachability from the entry', () => {
  const task = tasks.find((task) => task.id === 'upload-pipeline')!
  const board = solution(task)
  board.connections = board.connections.filter((connection) => connection.to !== 'Worker')
  board.connections.push(edge('Worker', 'Queue'), edge('Client', 'Worker'))
  const result = validateBoard(board, task)
  assert.equal(result.checks.find((check) => check.label.includes('Worker with'))?.passed, false)
  assert.equal(result.passed, false)
})

test('flow traces branching paths breadth-first with target replica capacity and no traffic splitting', () => {
  const board: Board = {
    components: [component('a', 'Client'), { ...component('b', 'App Server', { capacity: 200 }), replicas: 2 }, component('c'), component('d'), component('isolated')],
    connections: [edge('a', 'b'), edge('b', 'd'), edge('a', 'c')],
  }
  const trace = traceFlow(board, 'a', 300)
  assert.deepEqual(trace.steps.map((step) => [step.id, step.depth, step.rate, step.capacity, step.overloaded]), [
    ['a-b', 1, 300, 400, false], ['a-c', 1, 300, 100, true], ['b-d', 2, 300, 100, true],
  ])
  assert.deepEqual(trace.unreachable, ['isolated'])
  assert.equal(trace.truncated, false)
  assert.equal(traceFlow(board, 'a', 400).steps[0].overloaded, false)
  assert.equal(traceFlow(board, 'a', 401).steps[0].overloaded, true)
})

test('flow handles cycles, merged branches and dangling connections deterministically', () => {
  const board: Board = {
    components: ['a', 'b', 'c', 'd'].map((id) => component(id)),
    connections: [edge('a', 'b'), edge('a', 'c'), edge('b', 'd'), edge('c', 'd'), edge('d', 'a'), edge('a', 'missing'), edge('missing', 'b')],
  }
  const trace = traceFlow(board, 'a', 20)
  assert.deepEqual(trace.steps.map((step) => step.id), ['a-b', 'a-c', 'b-d', 'c-d', 'd-a'])
  assert.deepEqual(trace.unreachable, [])
  assert.deepEqual(traceFlow(board, 'a', 20), trace)
  assert.deepEqual(traceFlow(board, 'missing', 20), { steps: [], unreachable: ['a', 'b', 'c', 'd'], truncated: false })
  assert.deepEqual(traceFlow(emptyBoard(), 'a', 20), { steps: [], unreachable: [], truncated: false })
})

test('flow clamps invalid request rates and does not multiply capacity by shards', () => {
  const board: Board = {
    components: [component('a'), component('b', 'NoSQL DB', { capacity: 10, shards: 128 })],
    connections: [edge('a', 'b')],
  }
  for (const [input, expected] of [[NaN, 1], [Infinity, 1], [-Infinity, 1], [-10, 1], [0, 1], [200000, 100000], [1.5, 1.5]]) {
    assert.equal(traceFlow(board, 'a', input).steps[0].rate, expected)
  }
  assert.equal(traceFlow(board, 'a', 11).steps[0].capacity, 10)
  assert.equal(traceFlow(board, 'a', 11).steps[0].overloaded, true)
})

test('long traces are capped while unreachable results still reflect the entire graph', () => {
  const board: Board = {
    components: Array.from({ length: 205 }, (_, index) => component(String(index))),
    connections: Array.from({ length: 204 }, (_, index) => edge(String(index), String(index + 1))),
  }
  const result = traceFlow(board, '0', 100)
  assert.equal(result.steps.length, 200)
  assert.equal(result.truncated, true)
  assert.deepEqual(result.unreachable, [])
  board.connections.length = 200
  assert.equal(traceFlow(board, '0', 100).truncated, false)
})
