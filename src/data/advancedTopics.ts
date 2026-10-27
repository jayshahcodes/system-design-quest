import type { Topic } from '../types'

export const advancedTopics: Topic[] = [
  {
    id: 'load-balancing', title: 'Load balancing & stateless servers', icon: '⑂', minutes: 7, level: 'Intermediate',
    summary: 'Distribute traffic without losing session state or hiding bottlenecks.',
    sections: [
      { heading: 'Replicas share work, not magic', body: 'A load balancer selects a healthy backend for a request. Round-robin spreads requests by turn; least-connections considers active connections. Neither guarantees equal work when requests have different costs. Health checks should remove broken backends without overwhelming the remaining ones.' },
      { heading: 'Keep request handling stateless', body: 'If session data lives only in one process, sending the next request to a different replica can break the session. Put necessary state in shared durable storage or an appropriately secured token. Sticky sessions can be useful, but complicate failover and do not replace a state-management plan.' },
      { heading: 'Estimate, then measure', body: 'For a rough exercise, two replicas at 100 requests per second each suggest 200 requests per second of service capacity. Real results depend on shared databases, request mix, resource contention, and failure headroom. Do not convert user count directly into requests per second without assumptions.' },
    ],
    example: 'Practice design: Client → Load Balancer → stateless App Server replicas. If the shared database is saturated, adding application replicas can make things worse.',
    takeaway: 'Scale the bottleneck and preserve enough capacity to survive a replica failure.',
  },
  {
    id: 'caching', title: 'Caching & invalidation', icon: 'ϟ', minutes: 8, level: 'Intermediate',
    summary: 'Trade freshness, memory, and read load instead of just adding Redis.',
    sections: [
      { heading: 'Trace the cache miss', body: 'With cache-aside, the application looks in the cache, reads durable storage on a miss, and fills the cache. Write-through coordinates writes with the cache. Neither pattern alone solves concurrent update races; decide how readers may observe stale data.' },
      { heading: 'TTL is a policy, not consistency', body: 'A TTL bounds how long a particular cached entry is reused, but is not a guarantee of immediate freshness. An entry can also be evicted early. Invalidation on writes reduces staleness but needs reliable delivery and correct ordering. Do not cache data you cannot safely expose to other users.' },
      { heading: 'Protect the source of truth', body: 'A popular key expiring can create a stampede of misses. Request coalescing, jittered TTLs, and serving stale results where acceptable can reduce the spike. Measure hit rate, memory, evictions, and miss latency before selecting a policy.' },
    ],
    example: 'Published case: Meta’s 2013 TAO work describes a distributed cache-backed graph store with constrained operations. It illustrates why caching policies must fit the data model rather than being a transparent performance switch.',
    takeaway: 'Explain what happens on a miss, a write, an eviction, and a failed invalidation.',
    sources: [{ title: 'TAO: Facebook’s Distributed Data Store for the Social Graph (2013)', url: 'https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson', publisher: 'Meta / USENIX' }],
  },
  {
    id: 'queues', title: 'Queues, retries & backpressure', icon: '≋', minutes: 8, level: 'Intermediate',
    summary: 'Move slow work off the request path without losing control of it.',
    sections: [
      { heading: 'Separate acceptance from completion', body: 'A request can enqueue work and return before the work finishes. A worker consumes the job and records the outcome. The product needs a visible processing state: accepting a video upload is not the same as making the video ready to watch.' },
      { heading: 'Assume a job can arrive twice', body: 'A worker can finish its work and crash before acknowledging the message. A retry may then repeat the job. Use an idempotency key, deduplication record, or a state transition that safely recognizes already-completed work. Acknowledge only after the outcome is recorded durably.' },
      { heading: 'Bound the backlog', body: 'Retries without limits can amplify failures. Use backoff, retry budgets, and a dead-letter path for poison messages. Watch queue depth and the age of the oldest job. Backpressure means slowing or rejecting producers when consumers cannot keep up, rather than allowing unbounded growth.' },
    ],
    example: 'Proposed video-upload exercise: App Server → Queue → Worker → Object Storage. This is a generic learning pipeline, not a claim about YouTube’s internal upload architecture.',
    takeaway: 'Queues decouple timing, but reliability still needs idempotency, durable outcomes, and bounded retries.',
  },
  {
    id: 'cdn', title: 'CDNs & video delivery', icon: '◎', minutes: 8, level: 'Intermediate',
    summary: 'Learn from Netflix Open Connect: bring popular bytes closer to viewers.',
    sections: [
      { heading: 'Separate control and media delivery', body: 'A video application can authorize a viewer and return playback metadata while a delivery network serves the video segments. These are different request flows with different scaling needs. A CDN does not replace authentication, metadata storage, or media processing.' },
      { heading: 'Place content near demand', body: 'Netflix publicly describes Open Connect as its purpose-built content delivery network, with Open Connect Appliances deployed through ISP partnerships and peering. This published example shows how content placement and network proximity can reduce long-haul delivery traffic.' },
      { heading: 'Design the miss and update paths', body: 'A generic pull-based CDN may fetch a missing object from an origin; this exercise should not be mistaken for a precise model of Open Connect’s content-placement mechanisms. Immutable versioned assets make cache correctness easier. Origin capacity, cache keys, signed access, and purge behavior all need explicit decisions.' },
    ],
    example: 'Learning design: Viewer → CDN → Object Storage for media, and Viewer → App Server → SQL DB for metadata. Trace those paths separately rather than pretending every segment visits the metadata database.',
    takeaway: 'Optimize the bytes on the delivery path while keeping authorization and metadata responsibilities explicit.',
    sources: [{ title: 'Open Connect overview', url: 'https://openconnect.netflix.com/en/', publisher: 'Netflix' }],
  },
  {
    id: 'sharding', title: 'Sharding & database routing', icon: '▦', minutes: 10, level: 'Advanced',
    summary: 'Explore how Vitess grew from YouTube’s MySQL scaling challenges.',
    sections: [
      { heading: 'Partition by an access pattern', body: 'Sharding divides records across independently served partitions. A shard key should distribute work while keeping important queries local. A user ID can suit user-scoped data, but a single celebrity account or tenant can still create a hot shard. Replication copies data; sharding divides it.' },
      { heading: 'Learn from Vitess', body: 'Vitess originated at YouTube to help operate and scale MySQL. Its routing layer and sharding mechanisms demonstrate how clients can use a logical database interface while data lives across multiple MySQL instances. This is a documented historical origin, not a claim that every current YouTube datastore uses Vitess.' },
      { heading: 'Pay for distributed queries', body: 'Queries that do not include a routing key can fan out to many shards. Cross-shard joins, transactions, and resharding require extra coordination. More shards add operational complexity and do not automatically fix poor indexes, skew, or an overloaded shared dependency.' },
    ],
    example: 'Practice design: route feed records by user ID into a sharded store. Compare a local user-feed lookup with a global search that needs a separate index or scatter-gather.',
    takeaway: 'Choose the routing key first; explain hotspots and cross-shard operations before adding partitions.',
    sources: [{ title: 'Vitess: cloud-native database clustering for MySQL', url: 'https://vitess.io/', publisher: 'Vitess project (originated at YouTube)' }],
  },
  {
    id: 'consistency', title: 'Replication, consistency & consensus', icon: '↔', minutes: 11, level: 'Advanced',
    summary: 'Use Google Spanner to study guarantees, coordination, and their costs.',
    sections: [
      { heading: 'What can a reader observe?', body: 'With asynchronous replication, a follower can lag behind recent writes. Reading after writing may require a leader read or session-aware routing. Stronger consistency requires coordination; a network partition forces trade-offs between responding everywhere and preserving a chosen consistency guarantee.' },
      { heading: 'A published design, not a recipe', body: 'Google’s 2012 Spanner paper describes a globally distributed database using replication, distributed transactions, and TrueTime. TrueTime exposes time uncertainty; Spanner uses this with coordination to support externally consistent transactions. Ordinary wall clocks or a configured replica count do not provide those guarantees.' },
      { heading: 'Connect guarantees to the product', body: 'A bank balance and an approximate view count can need different guarantees. Consensus helps a replica group agree on an ordered state despite certain failures, but it does not by itself solve every cross-service transaction. State the failure model, write acknowledgement policy, and acceptable read staleness.' },
    ],
    example: 'Proposed exercise: compare a stale follower read of a profile with a transaction that must not overspend an account. The correct consistency choice follows the invariant, not a brand name.',
    takeaway: 'Name the invariant and failure model, then justify the coordination cost.',
    sources: [{ title: 'Spanner: Google’s Globally-Distributed Database (2012)', url: 'https://research.google/pubs/spanner-googles-globally-distributed-database/', publisher: 'Google Research' }],
  },
  {
    id: 'graph-feeds', title: 'Graph stores & feed fan-out', icon: '⑂', minutes: 10, level: 'Advanced',
    summary: 'Separate social graph lookups from the cost of building a timeline.',
    sections: [
      { heading: 'Start with graph access', body: 'A social graph stores entities and relationships: a user follows another user, a post belongs to an author. Meta’s TAO paper describes objects and associations behind a constrained graph API and a distributed caching architecture. Such access patterns are different from arbitrary graph analytics.' },
      { heading: 'Compare fan-out strategies', body: 'A proposed timeline can push a post ID into follower inboxes at write time or gather recent posts from followed authors at read time. Write-time fan-out lowers read work but makes high-follower authors expensive. Read-time aggregation saves write amplification but can increase read latency.' },
      { heading: 'A hybrid is still a trade-off', body: 'A learning design might push ordinary authors’ posts while merging celebrity posts during reads. It needs ordering, pagination, deduplication, privacy updates, and eventual removal. This is an exercise in trade-offs, not a statement about Meta’s or X’s current feed implementation.' },
    ],
    example: 'Published TAO concepts inform the relationship store; the feed exercise adds a proposed App Server → Queue → Worker → NoSQL DB fan-out path and a cache for reads.',
    takeaway: 'Do not confuse relationship storage with ranking, timeline materialization, or recommendations.',
    sources: [{ title: 'TAO: Facebook’s Distributed Data Store for the Social Graph (2013)', url: 'https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson', publisher: 'Meta / USENIX' }],
  },
  {
    id: 'distributed-ids', title: 'Distributed IDs & time', icon: '#', minutes: 9, level: 'Advanced',
    summary: 'Learn from Twitter’s Snowflake without assuming clocks are perfect.',
    sections: [
      { heading: 'Generate IDs without one database counter', body: 'Twitter’s archived Snowflake project documents a distributed ID service built around a timestamp, worker identifier, and sequence. The design aims for unique, roughly time-ordered IDs without coordinating every ID through one database counter.' },
      { heading: 'Protect uniqueness during failures', body: 'Worker identifiers must not collide, sequences have finite capacity, and clock rollback needs an explicit policy. A timestamp field is not a guarantee of strict global event ordering or causality. Different nodes can observe time differently.' },
      { heading: 'Choose an ID for the workload', body: 'Compare random identifiers, database sequences, and time-ordered IDs by collision behavior, index locality, information leakage, and operational cost. A URL shortener also needs an encoding and collision policy; a distributed ID alone is not the whole product.' },
    ],
    example: 'Published historical source: Twitter’s Snowflake repository is archived. The lesson uses that design to reason about ID generation, not to claim it describes every current X service.',
    takeaway: 'Uniqueness, sort order, and causal order are separate promises.',
    sources: [{ title: 'Snowflake (archived historical implementation)', url: 'https://github.com/twitter-archive/snowflake', publisher: 'Twitter' }],
  },
]
