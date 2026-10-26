import type { ComponentType } from './types.ts'

export const sections = [
  { id: 'learn', label: 'Learn', icon: '▤', subtitle: 'Build your foundation' },
  { id: 'quiz', label: 'Quiz', icon: '✧', subtitle: 'Put knowledge to work' },
  { id: 'game', label: 'Design Game', icon: '⌘', subtitle: 'Learn by building' },
] as const
export type Section = (typeof sections)[number]['id']
export type NavigationItem = (typeof sections)[number]

export const symbols = { arrow: '↗', right: '→', seed: '✳', quiz: '✧', game: '⌘', plus: '+', check: '✓', circle: '○', breadcrumb: '/ ', space: ' ' }
export const componentIcons: Record<ComponentType, string> = {
  Client: '▣', 'Load Balancer': '⑂', 'App Server': '▤', Cache: 'ϟ', 'SQL DB': '▱', Queue: '≋',
}

export const appCopy = {
  skip: 'Skip to content',
  home: 'System Design Quest home',
  brandMark: 'sq',
  brand: 'system design',
  brandSecond: 'quest',
  brandDot: '.',
  learningSpace: 'YOUR LEARNING SPACE',
  navigation: 'Main navigation',
  bigSystems: 'Big systems.',
  smallSteps: 'Small steps.',
  note: 'Every great architecture starts with understanding the basics.',
  phase: 'PHASE 01 · FOUNDATIONS',
  nextChapter: ' Your next chapter starts here',
  journey: 'YOUR JOURNEY ',
  track: ' Beginner track ',
  avatar: 'Y',
  footer: 'Built for curious minds.',
}

export const learnCopy = {
  back: '← All topics',
  realWorld: 'IN THE REAL WORLD',
  takeaway: 'The takeaway',
  practice: 'Practice this topic ↗',
  eyebrow: ' LEARN THE BUILDING BLOCKS',
  title: 'Think big. ',
  titleAccent: 'Start here.',
  intro: 'Understand the ideas behind the systems you use every day.',
  introNext: ' One concept at a time, at your own pace.',
  outline: 'BEGINNER FRIENDLY ↗',
  firstQuest: 'YOUR FIRST QUEST',
  heroTitle: 'From “how does it work?”',
  heroTitleNext: 'to “I can build that.”',
  heroDescription: 'Learn a concept. Test your intuition. Bring it to life.',
  explore: 'Explore the foundations ',
  client: 'CLIENT',
  server: 'SERVER',
  database: 'DATABASE',
  diagramCaption: 'A little curiosity. A lot of connections.',
  toolkit: 'Your foundation toolkit ',
  count: '05',
  essentials: 'Five essentials. A solid place to begin.',
  range: '01 — 05',
  level: '· Beginner',
  lessMemorizing: 'Less memorizing.',
  moreMaking: 'More making.',
  connectDots: 'Ready to connect the dots?',
  firstArchitecture: 'Build your first architecture.',
  tryGame: 'Try the Design Game ↗',
  startingPoint: 'There’s no perfect starting point.',
  curiosity: ' Pick a topic that sparks your curiosity.',
  startQuiz: 'Start Quiz →',
}

export const quizCopy = {
  eyebrow: 'CHECK YOUR INTUITION',
  title: 'A little practice. ',
  titleAccent: 'A deeper understanding.',
  intro: 'Short questions, real scenarios, and a lesson in every answer.',
  ready: 'Ready for a knowledge check?',
  description: 'Choose a topic or practice all five. You’ll see an explanation after each answer.',
  area: 'Practice area',
  allTopics: 'All foundation topics',
  start: 'Start Quiz ↗',
  complete: 'QUEST COMPLETE',
  perfect: 'You’ve got the foundations!',
  forward: 'Every attempt is a step forward.',
  again: 'Practice again ↗',
  scenario: 'SCENARIO',
  quick: 'QUICK CHECK',
  progress: 'Quiz progress',
  selectAnswer: 'Select an answer',
  correct: 'Exactly right.',
  incorrect: 'Not quite — here’s why.',
  check: 'Check answer',
  score: 'See my score',
  next: 'Next question →',
  restart: 'Restart quiz',
}

export const gameCopy = {
  eyebrow: 'YOUR ARCHITECTURE PLAYGROUND',
  title: 'Connect ideas. ',
  titleAccent: 'Build a system.',
  intro: 'Choose a quest, assemble the pieces, and see how your design measures up.',
  chooseTask: 'Choose your task',
  easy: 'EASY QUEST',
  hint: 'Need a hint?',
  mission: 'Your mission',
  storageWarning: 'Your browser could not save this board. You can keep playing, but changes may be lost on reload.',
  library: 'Component library',
  addHelp: 'Add Component · Click a block to add it.',
  replicasHelp: 'Replicas are instances of a component. Edit a block to configure them.',
  architecture: 'Your architecture ',
  flow: 'Directed request flow',
  blank: 'A blank canvas. A fresh possibility.',
  addPrompt: 'Add a component from the library to start your design.',
  addClient: 'Add Component: Client +',
  edit: 'Edit',
  delete: 'Delete',
  editComponent: 'Edit component',
  name: 'Name',
  type: 'Type',
  replicas: 'Replicas (1–100)',
  save: 'Save component',
  cancel: 'Cancel',
  connections: 'Connections ',
  connectionsHelp: 'Point each connection from the requester to the receiving component.',
  from: 'From',
  to: 'To',
  source: 'Select source',
  destination: 'Select destination',
  connect: 'Connect +',
  noConnections: 'No connections yet. Add two components, then connect them above.',
  remove: 'Remove',
  validate: 'Run Validation ↗',
  reset: 'Reset Task',
  unsaved: 'Changes not saved',
  saved: 'Board saved locally as you build',
  resetPrompt: 'Clear all components and connections for this task? Other tasks are kept.',
  confirmReset: 'Confirm reset',
  keepBuilding: 'Keep building',
  removed: 'Component and its connections removed.',
  updated: 'Component updated.',
  differentComponents: 'Choose two different components.',
  duplicateConnection: 'That connection already exists.',
  connected: 'Connection added.',
  disconnected: 'Connection removed.',
  validated: 'Validation complete. See your results below.',
  taskReset: 'Task reset. Start a fresh design.',
  complete: 'QUEST COMPLETE',
  iterate: 'KEEP ITERATING',
  meetsMission: 'Your design meets the mission.',
  gaps: 'Good start. Let’s fill in the gaps.',
  disclaimer: 'This is a structural check, not a traffic simulation or production-readiness assessment.',
}

export const validationCopy = { met: 'Requirement met.' }

export function topicFooter(count: number) {
  return `${count} topics. Endless possibilities. ↗`
}

export function lessonEyebrow(minutes: number) {
  return `FOUNDATIONS / ${minutes} MIN READ`
}

export function topicNumber(index: number) {
  return `0${index + 1}`
}

export function readingTime(minutes: number) {
  return `◷ ${minutes} min read `
}

export function quizDetails(count: number) {
  return `${count} questions · Multiple choice & scenarios · No time limit`
}

export function quizResult(score: number, total: number) {
  return `${Math.round(score / total * 100)}% correct. Revisit the lessons or try again to build confidence.`
}

export function questionProgress(current: number, total: number) {
  return `Question ${current} of ${total}`
}

export function scoreTotal(total: number) {
  return ` / ${total}`
}

export function taskOption(index: number, title: string) {
  return `0${index + 1} · ${title}`
}

export function componentName(type: ComponentType, count: number) {
  return `${type} ${count}`
}

export function componentAdded(type: ComponentType) {
  return `${type} added to your board.`
}

export function addComponentLabel(type: ComponentType) {
  return `Add Component: ${type}`
}

export function componentDetails(type: ComponentType, replicas: number) {
  return `${type} · ${replicas} ${replicas === 1 ? 'replica' : 'replicas'}`
}

export function editComponentLabel(name: string) {
  return `Edit ${name}`
}

export function deleteComponentLabel(name: string) {
  return `Delete ${name}`
}

export function removeConnectionLabel(from: string | undefined, to: string | undefined) {
  return `Remove connection ${from} to ${to}`
}

export function validationScore(score: number, total: number) {
  return `${score} / ${total}`
}

export function validationSummary(passed: boolean) {
  return ` requirements met · ${passed ? 'PASS' : 'NOT YET'}`
}

export function requirementFeedback(label: string, entryType: ComponentType) {
  return `${label}. Add or edit the relevant components and directed connections; keep them reachable from a ${entryType}.`
}
