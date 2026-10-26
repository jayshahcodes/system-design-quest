import type { Topic } from '../types'
import { advancedTopics } from './advancedTopics.ts'

export const topics: Topic[] = [
  {
    id: 'client-server', title: 'Client–server basics', icon: '↔', minutes: 5, level: 'Beginner',
    summary: 'Meet the two sides of every web interaction.',
    sections: [
      { heading: 'A conversation with two roles', body: 'A client requests a service. A server receives the request, performs work, and sends a response. Your browser is a client; the machine serving a website acts as a server. These are roles, not necessarily different kinds of hardware.' },
      { heading: 'Follow a request', body: 'When you open a page, your browser requests its HTML from a web server. It can then request CSS, images, and data. An application server may query a database before responding. Many clients can use the same server.' },
      { heading: 'Start small, then scale', body: 'One application server is a good starting point. When demand grows, replicas can share the work behind a load balancer. Replicas need a plan for shared data and sessions; copying a server alone does not solve every bottleneck.' },
    ],
    example: 'A simplified video site: browser → application server → video metadata. The browser may fetch the actual video from separate storage or a CDN.',
    takeaway: 'Trace who sends the request, who handles it, and what comes back.',
  },
  {
    id: 'http', title: 'HTTP & APIs', icon: '{ }', minutes: 6, level: 'Beginner',
    summary: 'Understand the contract between clients and services.',
    sections: [
      { heading: 'Requests and responses', body: 'HTTP is a protocol for exchanging messages. A request has a method, URL, headers, and sometimes a body. A response has a status code, headers, and often a body. HTTPS adds encryption in transit.' },
      { heading: 'Design a small API', body: 'An API exposes operations to other software. GET /links/abc can retrieve a short link; POST /links can create one with a JSON request body. GET should not change data. Validate inputs on the server, not only in the browser.' },
      { heading: 'Status codes tell a story', body: '200 means success, 201 means created, 400 indicates an invalid request, 404 means not found, and 500 indicates a server error. HTTP requests are stateless; applications use explicit tokens or cookies when they need session context.' },
    ],
    example: 'A URL shortener receives POST /links with a destination URL and returns 201 with the new short code.',
    takeaway: 'A clear API defines inputs, outputs, errors, and the meaning of each operation.',
  },
  {
    id: 'dns', title: 'DNS basics', icon: '◎', minutes: 4, level: 'Beginner',
    summary: 'How a friendly domain becomes a network address.',
    sections: [
      { heading: 'The internet’s directory', body: 'DNS maps names such as example.com to records, including IP addresses. Before connecting to a service, a client typically asks a DNS resolver for the address. DNS does not fetch the web page itself.' },
      { heading: 'Resolution and caching', body: 'A resolver can ask root, top-level domain, and authoritative name servers to find an answer. Browsers, operating systems, and resolvers cache answers to avoid repeating this work.' },
      { heading: 'Changes take time', body: 'A time-to-live (TTL) tells caches how long a record may be reused. After an address changes, some users may still reach the old address until cached records expire.' },
    ],
    example: 'Before your browser sends an HTTPS request to a learning site, DNS helps it discover the site’s address.',
    takeaway: 'DNS resolves the name; HTTP carries the application conversation.',
  },
  {
    id: 'databases', title: 'SQL vs NoSQL', icon: '▤', minutes: 7, level: 'Beginner',
    summary: 'Choose storage around your data and access patterns.',
    sections: [
      { heading: 'Relational databases', body: 'SQL databases organize data into tables with defined schemas. Keys and joins connect records. Transactions can group changes atomically, which is useful when several related updates must succeed or fail together.' },
      { heading: 'A family of alternatives', body: 'NoSQL includes document, key-value, wide-column, and graph databases. Their data models suit different access patterns. NoSQL is not a single consistency model, and it does not automatically mean faster or more scalable.' },
      { heading: 'Choose by requirements', body: 'Start with your queries, relationships, consistency needs, and operational constraints. Either family can support large systems. A cache can speed up repeated reads, but it needs expiration or invalidation and is not a substitute for durable storage.' },
    ],
    example: 'For a starter URL shortener, a SQL table can store code → destination mappings, while a cache serves frequently visited codes.',
    takeaway: 'Explain your access patterns before choosing a database.',
  },
  {
    id: 'performance', title: 'Latency vs throughput', icon: '↗', minutes: 5, level: 'Beginner',
    summary: 'Separate how fast one request is from how much work gets done.',
    sections: [
      { heading: 'Two different measurements', body: 'Latency is the time one operation takes, often measured in milliseconds. Throughput is the amount of work completed per unit of time, such as requests per second. Concurrent users are not the same as requests per second.' },
      { heading: 'Look beyond the average', body: 'A p95 latency of 200 ms means 95% of measured requests finish within 200 ms. Tail latency matters because a good average can hide slow experiences. Always state the workload and measurement conditions.' },
      { heading: 'Find the bottleneck', body: 'Replicas can increase throughput when work can be distributed. Caches may reduce repeated read latency. Neither guarantees improvement if another shared dependency is saturated. Measure before and after changing a design.' },
    ],
    example: 'A checkout API might handle 1,000 requests per second with p95 latency of 180 ms. Those numbers describe different properties.',
    takeaway: 'Ask both “How long does it take?” and “How much can we handle?”',
  },
  ...advancedTopics,
]
