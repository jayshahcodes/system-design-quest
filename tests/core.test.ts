import assert from 'node:assert/strict'
import { test } from 'node:test'
import { tasks } from '../src/data/tasks.ts'
import { topics } from '../src/data/topics.ts'
import { questions } from '../src/data/questions.ts'
import { emptyBoard, loadBoard, parseBoard, saveBoard, storageKey } from '../src/lib/storage.ts'
import { validateBoard } from '../src/lib/validation.ts'
import type { Board, ComponentType } from '../src/types.ts'

function board(types: ComponentType[], edges: [number, number][], replicas = 1): Board {
  return {
    components: types.map((type, index) => ({ id: String(index), type, name: type, replicas: type === 'App Server' ? replicas : 1 })),
    connections: edges.map(([from, to], index) => ({ id: String(index), from: String(from), to: String(to) })),
  }
}

test('every topic has a concept and scenario question with valid answers', () => {
  assert.equal(topics.length, 5)
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length)
  for (const topic of topics) {
    assert.ok(topic.sections.length > 0)
    for (const kind of ['concept', 'scenario']) {
      assert.ok(questions.some((question) => question.topicId === topic.id && question.kind === kind))
    }
  }
  for (const question of questions) {
    assert.ok(topics.some((topic) => topic.id === question.topicId))
    assert.ok(question.answer >= 0 && question.answer < question.options.length)
    assert.ok(question.explanation)
  }
})

test('empty boards fail each task with actionable feedback', () => {
  for (const task of tasks) {
    const result = validateBoard(emptyBoard(), task)
    assert.equal(result.passed, false)
    assert.equal(result.score, 0)
    assert.equal(result.total, task.rules.length)
    assert.ok(result.checks.every((check) => !check.passed && check.feedback.includes(check.label)))
  }
})

test('static website requires a directed client-to-server connection', () => {
  const valid = board(['Client', 'App Server'], [[0, 1]])
  assert.equal(validateBoard(valid, tasks[0]).passed, true)
  const reversed = board(['Client', 'App Server'], [[1, 0]])
  assert.equal(validateBoard(reversed, tasks[0]).score, 2)
  assert.equal(validateBoard(reversed, tasks[0]).passed, false)
  assert.equal(validateBoard({ ...valid, connections: [] }, tasks[0]).passed, false)
})

test('10k task requires connected app replicas, not an unrelated replicated server', () => {
  const valid = board(['Client', 'Load Balancer', 'App Server'], [[0, 1], [1, 2]], 2)
  assert.equal(validateBoard(valid, tasks[1]).passed, true)
  const insufficient = board(['Client', 'Load Balancer', 'App Server'], [[0, 1], [1, 2]])
  assert.equal(validateBoard(insufficient, tasks[1]).passed, false)
  insufficient.components.push({ id: 'unconnected', type: 'App Server', name: 'Unused replica', replicas: 2 })
  const result = validateBoard(insufficient, tasks[1])
  assert.equal(result.passed, false)
  assert.equal(result.checks.at(-1)?.passed, false)
})

test('URL shortener needs database and cache connections, not just components', () => {
  const valid = board(['Client', 'App Server', 'SQL DB', 'Cache'], [[0, 1], [1, 2], [1, 3]])
  assert.equal(validateBoard(valid, tasks[2]).passed, true)
  valid.connections.pop()
  assert.equal(validateBoard(valid, tasks[2]).passed, false)
  valid.connections.push({ id: 'dangling', from: 'missing', to: '3' })
  assert.equal(validateBoard(valid, tasks[2]).passed, false)
})

test('disconnected fragments cannot satisfy a complete request flow', () => {
  const splitBalancer = board(['Client', 'Load Balancer', 'Load Balancer', 'App Server'], [[0, 1], [2, 3]], 2)
  assert.equal(validateBoard(splitBalancer, tasks[1]).passed, false)
  const splitApp = board(['Client', 'App Server', 'App Server', 'SQL DB', 'Cache'], [[0, 1], [2, 3], [2, 4]])
  assert.equal(validateBoard(splitApp, tasks[2]).passed, false)
  splitApp.connections.push({ id: 'join', from: '0', to: '2' })
  assert.equal(validateBoard(splitApp, tasks[2]).passed, true)
})

test('valid board round-trips while absent or corrupt saved data falls back safely', () => {
  const valid = board(['Client', 'App Server'], [[0, 1]], 2)
  assert.deepEqual(parseBoard(JSON.stringify(valid)), valid)
  for (const value of [null, '', '{bad', 'null', '[]', '{}', '{"components":null,"connections":[]}']) {
    assert.deepEqual(parseBoard(value), emptyBoard())
  }
})

test('malformed components and relationships are rejected', () => {
  const valid = board(['Client', 'App Server'], [[0, 1]])
  const invalidComponents = [
    { ...valid.components[0], type: 'unknown' },
    { ...valid.components[0], name: ' ' },
    { ...valid.components[0], name: 'x'.repeat(81) },
    ...[0, -1, 1.5, 101, '2', null].map((replicas) => ({ ...valid.components[0], replicas })),
    null,
  ]
  for (const component of invalidComponents) {
    assert.deepEqual(parseBoard(JSON.stringify({ ...valid, components: [component, valid.components[1]] })), emptyBoard())
  }
  assert.deepEqual(parseBoard(JSON.stringify({ ...valid, components: [valid.components[0], valid.components[0]] })), emptyBoard())
  for (const connection of [
    { id: 'a', from: '0', to: 'missing' },
    { id: 'a', from: '0', to: '0' },
    { id: '', from: '0', to: '1' },
    null,
  ]) {
    assert.deepEqual(parseBoard(JSON.stringify({ ...valid, connections: [connection] })), emptyBoard())
  }
  assert.deepEqual(parseBoard(JSON.stringify({ ...valid, connections: [valid.connections[0], { ...valid.connections[0], id: 'second' }] })), emptyBoard())
})

test('boards save separately per task and storage failures do not throw', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map<string, string>()
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    } })
    const valid = board(['Client', 'App Server'], [[0, 1]])
    assert.equal(saveBoard('static-site', valid), true)
    assert.deepEqual(loadBoard('static-site'), valid)
    assert.deepEqual(loadBoard('shortener'), emptyBoard())
    assert.ok(values.has(storageKey('static-site')))
    saveBoard('shortener', valid)
    saveBoard('static-site', emptyBoard())
    assert.deepEqual(loadBoard('shortener'), valid)
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked') } })
    assert.deepEqual(loadBoard('static-site'), emptyBoard())
    assert.equal(saveBoard('static-site', valid), false)
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
})
