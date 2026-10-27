import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resources } from '../src/data/resources.ts'
import { topics } from '../src/data/topics.ts'
import { questions } from '../src/data/questions.ts'

const originalTopicIds = [
  'client-server', 'http', 'dns', 'databases', 'performance', 'load-balancing',
  'caching', 'queues', 'cdn', 'sharding', 'consistency', 'graph-feeds', 'distributed-ids',
]
const newTopicIds = [
  'retry-budgets', 'idempotent-workflows', 'fault-isolation', 'adaptive-concurrency',
  'slo-design', 'overload-control', 'failure-domains', 'live-event-fanout',
]

test('resource curation covers all requested groups with attributed HTTPS references', () => {
  assert.equal(resources.length, 12)
  assert.equal(new Set(resources.map((resource) => resource.id)).size, resources.length)
  assert.equal(new Set(resources.map((resource) => resource.url)).size, resources.length)
  assert.deepEqual([...new Set(resources.map((resource) => resource.publisher))].sort(),
    ['Amazon / AWS', 'Google', 'Jio ecosystem', 'Netflix'])
  for (const resource of resources) {
    const url = new URL(resource.url)
    assert.equal(url.protocol, 'https:')
    assert.equal(url.username, '')
    assert.equal(url.password, '')
    assert.ok(resource.attribution && resource.summary && resource.discussion)
    assert.ok(resource.concepts.length > 0 && resource.takeaways.length >= 3)
    assert.ok(resource.verificationNote)
    assert.ok(resource.verification === 'retrieved' || resource.verification === 'reference-only')
    assert.ok(resource.topicIds.length > 0)
    for (const topicId of resource.topicIds) {
      assert.ok(topics.some((topic) => topic.id === topicId), `${resource.id}: ${topicId}`)
    }
  }
})

test('retrieval labels separate fetched primary documentation from unavailable articles', () => {
  assert.deepEqual(resources.filter((resource) => resource.verification === 'retrieved').map((resource) => resource.id).sort(),
    ['aws-sdk-retries', 'google-recovery', 'netflix-concurrency', 'netflix-hystrix'])
  for (const resource of resources.filter((resource) => resource.kind === 'Engineering article' || resource.kind === 'Engineering guide')) {
    assert.equal(resource.verification, 'reference-only')
    assert.match(resource.verificationNote, /could not be retrieved/)
  }
  const historical = resources.filter((resource) => resource.publisher === 'Jio ecosystem')
  assert.equal(historical.length, 2)
  for (const resource of historical) {
    assert.match(resource.attribution, /Historical Hotstar/)
    assert.match(resource.verificationNote, /not attributed to Reliance Jio telecom/)
    assert.equal(new URL(resource.url).hostname, 'blog.hotstar.com')
  }
})

test('new lessons preserve the existing curriculum and add sourced exercises and quizzes', () => {
  assert.deepEqual(topics.slice(0, originalTopicIds.length).map((topic) => topic.id), originalTopicIds)
  assert.deepEqual(topics.slice(originalTopicIds.length).map((topic) => topic.id), newTopicIds)
  assert.equal(questions.length, 42)
  for (const id of newTopicIds) {
    const topic = topics.find((item) => item.id === id)!
    assert.ok(topic.sources?.length)
    assert.ok(topic.sections.length >= 3)
    assert.ok(topic.exercise?.prompt)
    assert.ok(topic.exercise!.checkpoints.length >= 3)
    for (const source of topic.sources!) {
      assert.ok(resources.some((resource) => resource.url === source.url && resource.topicIds.includes(topic.id)))
    }
    const quiz = questions.filter((question) => question.topicId === id)
    assert.deepEqual(quiz.map((question) => question.kind).sort(), ['concept', 'scenario'])
    assert.ok(quiz.every((question) => Number.isInteger(question.answer) && question.answer >= 0
      && question.answer < question.options.length && question.explanation.length > 0))
  }
})
