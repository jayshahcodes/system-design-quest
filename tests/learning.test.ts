import assert from 'node:assert/strict'
import { test } from 'node:test'
import { topics } from '../src/data/topics.ts'
import { questions } from '../src/data/questions.ts'
import { learningLevels, topicCount, topicNumber, topicRange } from '../src/constants.ts'

test('learning path expands from foundations to intermediate and advanced topics', () => {
  assert.equal(topics.length, 27)
  assert.equal(new Set(topics.map((topic) => topic.id)).size, topics.length)
  for (const level of learningLevels) {
    assert.ok(topics.some((topic) => topic.level === level))
  }
  for (const topic of topics) {
    assert.ok(topic.level && learningLevels.includes(topic.level))
    assert.ok(topic.sections.length >= 3)
    assert.equal(questions.filter((question) => question.topicId === topic.id).length, 2)
  }
})

test('case-study lessons link to primary sources and identify historical context', () => {
  for (const id of ['cdn', 'sharding', 'consistency', 'graph-feeds', 'distributed-ids']) {
    const topic = topics.find((item) => item.id === id)!
    assert.ok(topic.sources?.length)
    for (const source of topic.sources!) {
      assert.equal(new URL(source.url).protocol, 'https:')
      assert.ok(source.publisher && source.title)
    }
  }
  assert.ok(topics.find((topic) => topic.id === 'distributed-ids')!.example.includes('archived'))
})

test('topic counters support more than nine lessons', () => {
  assert.equal(topicNumber(9), '10')
  assert.equal(topicNumber(12), '13')
  assert.equal(topicCount(13), '13')
  assert.equal(topicRange(13), '01 — 13')
  assert.equal(topicRange(0), '—')
})
