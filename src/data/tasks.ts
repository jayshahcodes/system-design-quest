import type { TaskDefinition } from '../types'

export const tasks: TaskDefinition[] = [
  {
    id: 'static-site', title: 'Serve your first website', difficulty: 'Easy', entryType: 'Client',
    description: 'A visitor wants to read your static website. Build the smallest request path from a browser to a server. In this simplified library, an App Server also serves static files.',
    hint: 'Start with a Client and an App Server. Connections point in the direction of the request.',
    rules: [
      { kind: 'component', type: 'Client', label: 'Include a Client' },
      { kind: 'component', type: 'App Server', label: 'Include an App Server' },
      { kind: 'connection', from: 'Client', to: 'App Server', label: 'Connect Client → App Server' },
    ],
  },
  {
    id: 'ten-k', title: 'Welcome 10,000 users', difficulty: 'Easy', entryType: 'Client',
    description: 'Prepare a stateless web app for a growing audience. Put a load balancer in front of at least two app replicas. This exercise checks topology, not a real 10k-user capacity guarantee: user activity and per-server capacity still need measurement.',
    hint: 'Add Client → Load Balancer → App Server, then edit the connected App Server to have at least 2 replicas.',
    rules: [
      { kind: 'component', type: 'Client', label: 'Include a Client' },
      { kind: 'component', type: 'Load Balancer', label: 'Include a Load Balancer' },
      { kind: 'component', type: 'App Server', minReplicas: 2, label: 'Use an App Server with at least 2 replicas' },
      { kind: 'connection', from: 'Client', to: 'Load Balancer', label: 'Connect Client → Load Balancer' },
      { kind: 'connection', from: 'Load Balancer', to: 'App Server', label: 'Connect Load Balancer → replicated App Server' },
    ],
  },
  {
    id: 'shortener', title: 'Build a URL shortener', difficulty: 'Easy', entryType: 'Client',
    description: 'Let visitors resolve short links. Store mappings durably in a SQL database and add a cache for popular lookups. The app checks the cache first and queries the database on a miss.',
    hint: 'Use Client → App Server, App Server → SQL DB, and App Server → Cache. The app coordinates cache misses.',
    rules: [
      { kind: 'component', type: 'Client', label: 'Include a Client' },
      { kind: 'component', type: 'App Server', label: 'Include an App Server' },
      { kind: 'component', type: 'SQL DB', label: 'Include a SQL DB' },
      { kind: 'component', type: 'Cache', label: 'Include a Cache' },
      { kind: 'connection', from: 'Client', to: 'App Server', label: 'Connect Client → App Server' },
      { kind: 'connection', from: 'App Server', to: 'SQL DB', label: 'Connect App Server → SQL DB' },
      { kind: 'connection', from: 'App Server', to: 'Cache', label: 'Connect App Server → Cache' },
    ],
  },
]
