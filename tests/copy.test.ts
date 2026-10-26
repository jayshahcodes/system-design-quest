import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  addComponentLabel, componentAdded, componentDetails, componentName, deleteComponentLabel,
  editComponentLabel, lessonEyebrow, questionProgress, quizDetails, quizResult, readingTime,
  removeConnectionLabel, requirementFeedback, scoreTotal, taskOption, topicFooter, topicNumber,
  validationCopy, validationScore, validationSummary,
} from '../src/constants.ts'

test('learning copy keeps numbering, reading-time spacing and footer punctuation', () => {
  assert.equal(topicNumber(0), '01')
  assert.equal(topicNumber(4), '05')
  assert.equal(lessonEyebrow(4), 'FOUNDATIONS / 4 MIN READ')
  assert.equal(readingTime(4), '◷ 4 min read ')
  assert.equal(topicFooter(5), '5 topics. Endless possibilities. ↗')
  assert.equal(taskOption(1, 'A quest'), '02 · A quest')
})

test('quiz copy preserves progress, score formatting and percentage rounding', () => {
  assert.equal(quizDetails(10), '10 questions · Multiple choice & scenarios · No time limit')
  assert.equal(questionProgress(1, 10), 'Question 1 of 10')
  assert.equal(scoreTotal(10), ' / 10')
  assert.equal(quizResult(2, 3), '67% correct. Revisit the lessons or try again to build confidence.')
})

test('component copy preserves generated names, feedback and replica plurals', () => {
  assert.equal(componentName('App Server', 2), 'App Server 2')
  assert.equal(componentAdded('SQL DB'), 'SQL DB added to your board.')
  assert.equal(componentDetails('Client', 1), 'Client · 1 replica')
  assert.equal(componentDetails('App Server', 2), 'App Server · 2 replicas')
})

test('dynamic accessible labels keep component and connection names', () => {
  assert.equal(addComponentLabel('Cache'), 'Add Component: Cache')
  assert.equal(editComponentLabel('My server'), 'Edit My server')
  assert.equal(deleteComponentLabel('My server'), 'Delete My server')
  assert.equal(removeConnectionLabel('Client 1', 'App Server 1'), 'Remove connection Client 1 to App Server 1')
})

test('validation copy preserves requirement feedback and result spacing', () => {
  assert.equal(validationCopy.met, 'Requirement met.')
  assert.equal(requirementFeedback('Add a server', 'Client'), 'Add a server. Add or edit the relevant components and directed connections; keep them reachable from a Client.')
  assert.equal(validationScore(2, 3), '2 / 3')
  assert.equal(validationSummary(true), ' requirements met · PASS')
  assert.equal(validationSummary(false), ' requirements met · NOT YET')
})
