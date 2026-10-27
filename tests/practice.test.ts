import assert from 'node:assert/strict'
import { test } from 'node:test'
import { practiceResources } from '../src/data/practiceResources.ts'
import { practiceTasks } from '../src/data/practiceTasks.ts'
import { topics } from '../src/data/topics.ts'
import { questions } from '../src/data/questions.ts'
import { tasks } from '../src/data/tasks.ts'
import { filterResources } from '../src/lib/resources.ts'
import { validateBoard } from '../src/lib/validation.ts'
import { parseBoard, storageKey } from '../src/lib/storage.ts'
import type { Board, TaskDefinition } from '../src/types.ts'

const practiceIds = [
  'rate-limiting', 'pagination-indexes', 'transaction-boundaries',
  'event-log-projections', 'realtime-delivery', 'geo-routing',
]

function solution(task: TaskDefinition): Board {
  return {
    components: task.rules.flatMap((rule) => rule.kind === 'component' ? [{
      id: rule.type, name: rule.type, type: rule.type, replicas: rule.minReplicas ?? 1,
      settings: { stateless: rule.stateless ?? true, shards: rule.minShards ?? 1 },
    }] : []),
    connections: task.rules.flatMap((rule, index) => rule.kind === 'connection' ? [{
      id: String(index), from: rule.from, to: rule.to,
    }] : []),
  }
}

test('all requested external references are honest, attributed, and searchable', () => {
  assert.deepEqual(practiceResources.map((resource) => resource.url), [
    'https://systemdesign.io', 'https://fanout.sh/system/overview',
    'https://fanout.sh/system/systems', 'https://fanout.sh/system/case-studies',
  ])
  for (const resource of practiceResources) {
    assert.equal(resource.verification, 'reference-only')
    assert.equal(resource.kind, 'Learning directory')
    assert.match(resource.verificationNote, /DNS lookup failed/)
    assert.match(resource.verificationNote, /original exercises, not summaries/)
    assert.ok(resource.attribution)
    assert.equal(new URL(resource.url).protocol, 'https:')
    assert.ok(resource.topicIds.every((id) => practiceIds.includes(id)))
  }
  assert.equal(filterResources(practiceResources, { publisher: 'Fanout', concept: 'Geo routing', query: '' }).length, 2)
  assert.equal(filterResources(practiceResources, { publisher: 'SystemDesign.io', concept: 'Pagination', query: '  CURSOR  ' }).length, 0)
  assert.equal(filterResources(practiceResources, { publisher: 'SystemDesign.io', concept: 'Pagination', query: '  ORDERED  ' }).length, 1)
})

test('original practice lessons include exercises and exactly paired quizzes', () => {
  assert.deepEqual(topics.slice(-6).map((topic) => topic.id), practiceIds)
  for (const id of practiceIds) {
    const topic = topics.find((item) => item.id === id)!
    assert.ok(topic.sections.length >= 3)
    assert.ok(topic.exercise?.prompt)
    assert.ok(topic.exercise!.checkpoints.length >= 3)
    const quiz = questions.filter((question) => question.topicId === id)
    assert.deepEqual(quiz.map((question) => question.kind).sort(), ['concept', 'scenario'])
    assert.ok(quiz.every((question) => question.options.length === 4 && Number.isInteger(question.answer)
      && question.answer >= 0 && question.answer < 4 && question.explanation.length > 0))
  }
})

test('new quest progression preserves existing IDs and independent storage keys', () => {
  assert.deepEqual(tasks.slice(0, 7).map((task) => task.id), [
    'static-site', 'ten-k', 'shortener', 'upload-pipeline', 'cached-feed', 'cdn-playback', 'search-indexing',
  ])
  assert.equal(tasks.length, 10)
  assert.equal(new Set(tasks.map((task) => task.id)).size, tasks.length)
  assert.deepEqual(practiceTasks.map((task) => task.difficulty), ['Easy', 'Medium', 'Hard'])
  assert.equal(new Set(tasks.map((task) => storageKey(task.id))).size, tasks.length)
})

test('new tasks pass with connected settings, fail with missing edges, and persist', () => {
  for (const task of practiceTasks) {
    const board = solution(task)
    assert.equal(validateBoard(board, task).passed, true, task.id)
    assert.deepEqual(parseBoard(JSON.stringify(board)), board)
    for (const edge of board.connections) {
      const broken = { ...board, connections: board.connections.filter((connection) => connection.id !== edge.id) }
      assert.equal(validateBoard(broken, task).passed, false, `${task.id}: ${edge.from} -> ${edge.to}`)
    }
    for (const rule of task.rules) {
      if (rule.kind !== 'component' || !rule.minReplicas) continue
      const insufficient = structuredClone(board)
      insufficient.components.find((component) => component.type === rule.type)!.replicas = rule.minReplicas - 1
      assert.equal(validateBoard(insufficient, task).passed, false, `${task.id}: ${rule.type}`)
    }
  }
})
