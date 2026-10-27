import assert from 'node:assert/strict'
import { test } from 'node:test'
import { filterResources, resourceConcepts, resourcePublishers } from '../src/lib/resources.ts'
import type { LearningResource } from '../src/types.ts'

const fixtures: LearningResource[] = [
  {
    id: 'netflix', title: 'Playback architecture', url: 'https://netflixtechblog.com/',
    publisher: 'Netflix', attribution: 'Published by Netflix engineers about streaming',
    kind: 'Engineering article', level: 'Advanced', concepts: ['Caching', 'Resilience'],
    summary: 'Reduce origin demand with regional replicas.',
    takeaways: ['Evaluate eviction policies', 'Measure hit ratios'],
    discussion: 'Which failure matters?', topicIds: ['cache'],
    verification: 'reference-only', verificationNote: 'Not retrieved in this session.',
  },
  {
    id: 'google', title: 'Storage design', url: 'https://research.google/',
    publisher: 'Google', attribution: 'Google research on databases',
    kind: 'Engineering guide', level: 'Intermediate', concepts: ['Consistency', 'Resilience'],
    summary: 'Choose a replication strategy.', takeaways: ['Compare quorum choices'],
    discussion: 'What consistency is needed?', topicIds: ['consistency'],
    verification: 'retrieved', verificationNote: 'Retrieved during curation.',
  },
  {
    id: 'netflix-second', title: 'Caching a catalog', url: 'https://netflixtechblog.com/',
    publisher: 'Netflix', attribution: 'Netflix engineering',
    kind: 'Engineering article', level: 'Advanced', concepts: ['Caching'],
    summary: 'Catalog delivery trade-offs.', takeaways: ['Consider stale data'],
    discussion: 'When should entries expire?', topicIds: ['cache'],
    verification: 'reference-only', verificationNote: 'Not retrieved in this session.',
  },
]

function ids(resources: LearningResource[]): string[] {
  return resources.map(function resourceId(resource) { return resource.id })
}

test('resource search matches every supported text field, ignoring query case and surrounding whitespace', () => {
  for (const query of ['PLAYBACK', ' regional replicas ', 'netflix engineers', 'caching', 'EVICTION POLICIES']) {
    const matches = filterResources(fixtures, { query, publisher: 'all', concept: 'all' })
    assert.ok(ids(matches).includes('netflix'), query)
  }
  assert.deepEqual(ids(filterResources(fixtures, { query: '   ', publisher: 'all', concept: 'all' })), ids(fixtures))
})

test('resource filters compose conjunctively using exact publisher and concept matches', () => {
  assert.deepEqual(ids(filterResources(fixtures, {
    query: 'architecture', publisher: 'Netflix', concept: 'Resilience',
  })), ['netflix'])
  assert.deepEqual(ids(filterResources(fixtures, {
    query: '', publisher: 'Google', concept: 'Resilience',
  })), ['google'])
  assert.deepEqual(ids(filterResources(fixtures, {
    query: '', publisher: 'Netflix', concept: 'Caching',
  })), ['netflix', 'netflix-second'])
  for (const filters of [
    { query: '', publisher: 'netflix', concept: 'all' },
    { query: '', publisher: 'all', concept: 'caching' },
    { query: 'architecture', publisher: 'Google', concept: 'all' },
    { query: '', publisher: 'Google', concept: 'Caching' },
    { query: 'nonexistent', publisher: 'all', concept: 'all' },
  ]) {
    assert.deepEqual(filterResources(fixtures, filters), [])
  }
})

test('filtering and filter options preserve inputs and listing order', () => {
  const original = structuredClone(fixtures)
  const result = filterResources(fixtures, { query: '', publisher: 'Netflix', concept: 'all' })
  assert.deepEqual(ids(result), ['netflix', 'netflix-second'])
  assert.notEqual(result, fixtures)
  assert.equal(result[0], fixtures[0])
  resourcePublishers(fixtures)
  resourceConcepts(fixtures)
  assert.deepEqual(fixtures, original)
})

test('resource filter options are sorted and deduplicated and handle empty collections', () => {
  assert.deepEqual(resourcePublishers(fixtures), ['Google', 'Netflix'])
  assert.deepEqual(resourceConcepts(fixtures), ['Caching', 'Consistency', 'Resilience'])
  assert.deepEqual(resourcePublishers([]), [])
  assert.deepEqual(resourceConcepts([]), [])
  assert.deepEqual(filterResources([], { query: '', publisher: 'all', concept: 'all' }), [])
})
