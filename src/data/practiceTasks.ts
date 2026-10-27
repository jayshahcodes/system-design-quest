import type { TaskDefinition } from '../types.ts'

export const practiceTasks: TaskDefinition[] = [
  {
    id: 'browse-catalog', title: 'Browse a durable catalog', difficulty: 'Easy', entryType: 'Client',
    description: 'Build the minimal read path for a catalog. The API reads durable records from SQL DB. Discuss a stable sort key, supporting index, and authorization on every page using the pagination lesson. Validation checks only topology; query plans and cursor correctness are not simulated.',
    hint: 'Use Client → App Server → SQL DB. Explain why a next-page token is not an authorization credential.',
    rules: [
      { kind: 'component', type: 'Client', label: 'Include a Client' },
      { kind: 'component', type: 'App Server', label: 'Include a reachable App Server' },
      { kind: 'component', type: 'SQL DB', label: 'Include a reachable SQL DB' },
      { kind: 'connection', from: 'Client', to: 'App Server', label: 'Connect Client → App Server' },
      { kind: 'connection', from: 'App Server', to: 'SQL DB', label: 'Connect App Server → SQL DB' },
    ],
  },
  {
    id: 'durable-notifications', title: 'Deliver durable notifications', difficulty: 'Medium', entryType: 'Client',
    description: 'Accept notification requests into durable SQL records and process delivery asynchronously. Use an outbox in the same SQL transaction as the request, with a publisher represented by App Server forwarding to Queue. This diagram cannot prove outbox atomicity, delivery order, authentication, or deduplication; explain these in the transaction and realtime exercises.',
    hint: 'Connect Client → App Server, App Server → SQL DB and Queue, Queue → Worker, and Worker → SQL DB. Use two stateless Worker replicas. The app-to-queue edge abstracts a retrying outbox publisher, not an atomic dual write.',
    rules: [
      { kind: 'component', type: 'Client', label: 'Include a Client' },
      { kind: 'component', type: 'App Server', stateless: true, label: 'Use a reachable stateless App Server' },
      { kind: 'component', type: 'SQL DB', label: 'Include a reachable SQL DB' },
      { kind: 'component', type: 'Queue', label: 'Include a reachable Queue' },
      { kind: 'component', type: 'Worker', minReplicas: 2, stateless: true, label: 'Use a reachable stateless Worker with 2 replicas' },
      { kind: 'connection', from: 'Client', to: 'App Server', label: 'Connect Client → App Server' },
      { kind: 'connection', from: 'App Server', to: 'SQL DB', label: 'Connect App Server → SQL DB' },
      { kind: 'connection', from: 'App Server', to: 'Queue', label: 'Connect outbox publisher (App Server) → Queue' },
      { kind: 'connection', from: 'Queue', to: 'Worker', label: 'Connect Queue → Worker' },
      { kind: 'connection', from: 'Worker', to: 'SQL DB', label: 'Connect Worker → SQL DB to record delivery state' },
    ],
  },
  {
    id: 'rebuild-read-model', title: 'Rebuild an event-driven read model', difficulty: 'Hard', entryType: 'Client',
    description: 'Separate durable command records from a sharded read projection. SQL DB represents authoritative records plus an outbox; Queue abstracts transport, not an automatically replayable permanent log. Workers update a NoSQL read model, and the API reads it. Discuss replay retention, deduplication, per-entity versions, and a controlled cutover. Validation does not execute transactions, replay, or consistency checks.',
    hint: 'Build Client → Load Balancer → App Server; branch App Server to SQL DB, Queue, and NoSQL DB; connect Queue → Worker → NoSQL DB. Use two stateless app/worker replicas and four NoSQL shards. These counts are illustrative, not benchmarks.',
    rules: [
      { kind: 'component', type: 'Client', label: 'Include a Client' },
      { kind: 'component', type: 'Load Balancer', label: 'Include a reachable Load Balancer' },
      { kind: 'component', type: 'App Server', minReplicas: 2, stateless: true, label: 'Use a reachable stateless App Server with 2 replicas' },
      { kind: 'component', type: 'SQL DB', label: 'Include a reachable SQL DB for authoritative records' },
      { kind: 'component', type: 'Queue', label: 'Include a reachable Queue for event transport' },
      { kind: 'component', type: 'Worker', minReplicas: 2, stateless: true, label: 'Use a reachable stateless Worker with 2 replicas' },
      { kind: 'component', type: 'NoSQL DB', minShards: 4, label: 'Use a reachable NoSQL DB with at least 4 shards' },
      { kind: 'connection', from: 'Client', to: 'Load Balancer', label: 'Connect Client → Load Balancer' },
      { kind: 'connection', from: 'Load Balancer', to: 'App Server', label: 'Connect Load Balancer → App Server' },
      { kind: 'connection', from: 'App Server', to: 'SQL DB', label: 'Connect App Server → SQL DB' },
      { kind: 'connection', from: 'App Server', to: 'Queue', label: 'Connect outbox publisher (App Server) → Queue' },
      { kind: 'connection', from: 'Queue', to: 'Worker', label: 'Connect Queue → Worker' },
      { kind: 'connection', from: 'Worker', to: 'NoSQL DB', label: 'Connect Worker → NoSQL DB to update the projection' },
      { kind: 'connection', from: 'App Server', to: 'NoSQL DB', label: 'Connect App Server → NoSQL DB to read the projection' },
    ],
  },
]
