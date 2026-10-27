import type { Topic } from '../types.ts'
import { resources } from './resources.ts'

function sources(...ids: string[]): NonNullable<Topic['sources']> {
  return ids.map(function source(id) {
    const resource = resources.find(function matches(item) { return item.id === id })!
    return { title: resource.title, url: resource.url, publisher: resource.attribution }
  })
}

export const reliabilityTopics: Topic[] = [
  {
    id: 'retry-budgets', title: 'Deadlines, retry budgets & jitter', icon: '↻', minutes: 10, level: 'Intermediate',
    summary: 'Make transient failures survivable without multiplying the load.',
    sections: [
      { heading: 'A timeout is uncertainty', body: 'A caller can time out after the server committed a change. Treat the outcome as unknown, not as evidence that nothing happened. A deadline should cover the full operation, including connection setup where relevant, and leave time for a useful response or fallback.' },
      { heading: 'Count attempts across layers', body: 'If three layers each make at most three total attempts, a single top-level operation can cause up to 27 calls at the deepest dependency. Assign retry ownership and cap total attempts and elapsed time. Retry only when the operation is safe to repeat and the failure may be transient.' },
      { heading: 'Spread recovery traffic', body: 'Backoff increases the delay between attempts; jitter randomizes it so clients do not synchronize their retries. Both still need a limit. Respect overload feedback and stop retrying when the user’s deadline has passed. Track original requests, retries, and successful useful work separately.' },
    ],
    example: 'Reading companion: Amazon Builders’ Library’s timeouts/retries guide. These are general reliability principles and an original exercise; the linked article body was not fetched during this update.',
    takeaway: 'A retry is additional load and a possible duplicate side effect, not a free recovery mechanism.',
    sources: sources('amazon-retries', 'aws-sdk-retries'),
    exercise: { prompt: 'Design a checkout call with a one-second user deadline and a temporarily failing inventory service.', checkpoints: ['State the timeout and retry owner at every hop.', 'Compute the worst-case downstream attempts.', 'Explain how a late success and an expired deadline are handled.'] },
  },
  {
    id: 'idempotent-workflows', title: 'Idempotent APIs & durable workflows', icon: '✓', minutes: 12, level: 'Advanced',
    summary: 'Preserve user intent when requests, messages, and acknowledgements repeat.',
    sections: [
      { heading: 'Give an operation an identity', body: 'An idempotency key identifies the same logical operation across attempts. Scope it to the caller and bind it to a payload or intent. Reusing the key for different input should be rejected rather than silently creating a different result.' },
      { heading: 'Close the recording gap', body: 'If the effect commits but the deduplication record does not, a retry can duplicate the effect. If the record commits first and the effect never happens, retries can falsely report success. Store both atomically when possible, or use a recoverable workflow with explicit pending/completed states and reconciliation.' },
      { heading: 'Define the lifetime and the boundaries', body: 'Keys have retention windows and storage costs. A retry after expiry may no longer be recognized. For external side effects, propagate a suitable key or reconcile the remote outcome. Exactly-once wording is not a substitute for describing these boundaries.' },
    ],
    example: 'Proposed order workflow inspired by the questions in Amazon’s idempotent-API reading reference: a lost response must not create a second order. This is not a reproduction of Amazon’s order system.',
    takeaway: 'Deduplication correctness depends on atomicity, identity, and retention—not just a cache of request IDs.',
    sources: sources('amazon-idempotency'),
    exercise: { prompt: 'An order commits, the network drops the response, and two retries arrive concurrently.', checkpoints: ['Define a unique constraint for the operation token.', 'Specify the response to a duplicate token and mismatched input.', 'Describe recovery after a crash between recording intent and completing a remote action.'] },
  },
  {
    id: 'fault-isolation', title: 'Bulkheads, circuit breakers & fallbacks', icon: '⑂', minutes: 11, level: 'Advanced',
    summary: 'Contain a slow dependency before it consumes every shared resource.',
    sections: [
      { heading: 'Isolate resource pools', body: 'A bulkhead limits how much one workload or dependency can consume. Separate concurrency budgets or worker pools can stop an optional recommendation service from exhausting all request-handling threads. Isolation has overhead and needs a plan for what happens when its budget is full.' },
      { heading: 'Stop calls that are unlikely to help', body: 'A circuit breaker can reject calls after a failure threshold and permit limited probes during recovery. It differs from a timeout, which bounds one attempt, and from a concurrency limiter, which bounds in-flight work. Poorly tuned breakers can delay recovery or oscillate.' },
      { heading: 'Make degraded responses explicit', body: 'A fallback might omit optional recommendations or use a stale result if the product permits it. It must not pretend an unconfirmed payment succeeded or leak another user’s cached data. Monitor fallback usage, probe recovery, and communicate reduced functionality.' },
    ],
    example: 'Retrieved Netflix Hystrix documentation describes isolation, circuit breakers, and fallbacks. It also explicitly says the project is in maintenance mode. Study the patterns without treating the historical library as a new-adoption recommendation.',
    takeaway: 'A safe fallback preserves product invariants while reducing dependency coupling.',
    sources: sources('netflix-hystrix'),
    exercise: { prompt: 'The recommendation dependency becomes ten times slower while playback still works.', checkpoints: ['Separate essential and optional resource budgets.', 'Specify timeout, breaker, and fallback responsibilities.', 'Choose signals that reveal prolonged degradation rather than hiding it.'] },
  },
  {
    id: 'adaptive-concurrency', title: 'Adaptive concurrency & queueing', icon: '↗', minutes: 12, level: 'Advanced',
    summary: 'Use measured latency to reason about in-flight work, not only request rate.',
    sections: [
      { heading: 'Apply Little’s Law carefully', body: 'For a stable measured system, average in-flight work equals average completion rate multiplied by average time in the system. At 500 completions per second and 0.2 seconds average duration, that is about 100 in-flight requests. Use consistent boundaries and units; this is not a tail-latency guarantee.' },
      { heading: 'A rate limit can miss a slowdown', body: 'If service time rises, the same arrival rate can create more concurrent work and growing queues. An admission limiter caps in-flight requests and rejects or delays additional work. The limit should protect useful throughput without building an unbounded waiting room in front of itself.' },
      { heading: 'Adapt, but test the feedback loop', body: 'Netflix’s public concurrency-limits README describes borrowing congestion-control ideas and using latency measurements to estimate pressure. It documents algorithms and traffic partitions, not a single universal setting. Sampling, burstiness, workload changes, and interactions between client and server controls can affect stability.' },
    ],
    example: 'Verified reference: Netflix’s concurrency-limits project README. Its linked Performance Under Load article is further reading, but the article body was not retrieved here. The app’s flow explorer does not implement these adaptive algorithms.',
    takeaway: 'Request rate, concurrency, latency, and queue depth are related measurements—not interchangeable controls.',
    sources: sources('netflix-concurrency', 'netflix-performance'),
    exercise: { prompt: 'A service processes 500 requests/sec. Average duration increases from 200 ms to 800 ms.', checkpoints: ['Estimate the change from 100 to 400 average in-flight requests under stable throughput.', 'Identify queue depth, latency, and rejection signals to measure.', 'Explain when rejecting optional traffic is better than allowing all work to wait.'] },
  },
  {
    id: 'slo-design', title: 'SLIs, SLOs & error budgets', icon: '◎', minutes: 10, level: 'Intermediate',
    summary: 'Turn “reliable” into a user-centered, measurable objective.',
    sections: [
      { heading: 'Measure the user outcome', body: 'An indicator is a measurement, such as the fraction of playback attempts that start within a chosen threshold. An objective states a target for that indicator over a window. An agreement adds external commitments and consequences. A healthy server process is not necessarily a successful user experience.' },
      { heading: 'Define good events and the denominator', body: 'State exactly which events count, what success means, which users or regions are measured, and the time window. A 99.9% good-event objective allows a 0.1% bad-event budget for that event population. This is not automatically equivalent to a fixed number of downtime minutes.' },
      { heading: 'Use the budget to guide decisions', body: 'Compare how quickly bad events consume the allowed budget against the remaining window. Fast consumption can justify investigation or pausing risky releases. Segment measurements so an acceptable global aggregate does not hide a severely affected region or customer group.' },
    ],
    example: 'Companion reading: the Service Level Objectives chapter of Google’s SRE book. The playback objective in this lesson is a proposed metric, not a reported Google service objective.',
    takeaway: 'Define the user outcome, measurement boundary, and budget before promising a reliability percentage.',
    sources: sources('google-slos'),
    exercise: { prompt: 'Define a reliability objective for a live sports viewer joining a stream.', checkpoints: ['Name the good event, denominator, window, and threshold.', 'Compute the bad-event budget for one million eligible attempts at 99.9%.', 'Explain how a single affected region could be hidden in the global average.'] },
  },
  {
    id: 'overload-control', title: 'Load shedding & graceful overload', icon: 'ϟ', minutes: 11, level: 'Advanced',
    summary: 'Protect useful work when demand exceeds the capacity you actually have.',
    sections: [
      { heading: 'A queue is not extra processing capacity', body: 'A bounded queue can absorb a short burst, but it does not increase the long-run service rate. If arrivals keep exceeding completions, queued work ages and deadlines expire. Rejecting early can free resources for requests that still have a chance to finish.' },
      { heading: 'Choose a priority policy', body: 'Separate essential actions from optional enrichment or batch work. Use per-tenant limits or reserved budgets where appropriate so one workload does not monopolize everything. Protect authentication and authorization checks; overload is not a reason to bypass correctness or security.' },
      { heading: 'Close the loop with callers', body: 'Shed load with a documented error and retry policy. Otherwise immediate retries can replace rejected work with a retry storm. Measure useful throughput, queue age, saturation, and rejection rates together. Test recovery as well as the initial overload behavior.' },
    ],
    example: 'Google’s Handling Overload chapter and Netflix’s concurrency documentation provide complementary reading paths. The queue and priority scenario here is general design guidance; it is not a verified account of either company’s current thresholds.',
    takeaway: 'A controlled rejection can be safer than a slow failure that consumes the entire system.',
    sources: sources('google-overload', 'netflix-concurrency'),
    exercise: { prompt: 'A stream-start API and recommendation API compete for a saturated pool.', checkpoints: ['State which work can be degraded and which invariants must still hold.', 'Bound the queue and define deadline-aware rejection.', 'Describe client backoff and the metrics that show recovery.'] },
  },
  {
    id: 'failure-domains', title: 'Failure domains & static stability', icon: '▦', minutes: 12, level: 'Advanced',
    summary: 'Plan surviving capacity before a zone fails, not during the outage.',
    sections: [
      { heading: 'Draw the shared dependencies', body: 'A failure domain is a set of resources that may fail together, such as a zone, network path, or shared control service. Replicas in the same failure domain do not provide the independence implied by a simple replica count. Map identity, routing, storage, and configuration dependencies too.' },
      { heading: 'Reserve capacity for loss', body: 'In a simplified three-zone service with balanced traffic, losing one zone shifts total work across the two survivors. Each must handle 1.5 times its previous load. This arithmetic assumes independent capacity and no new bottleneck; it is not proof that the storage and network layers can fail over safely.' },
      { heading: 'Avoid recovery-only dependencies', body: 'A design that requires creating servers, changing permissions, or fetching new configuration during an outage can depend on an unavailable control plane. Pre-provisioned headroom and rehearsed recovery paths reduce that dependency. They cost money and still require data correctness, routing, and recovery-time testing.' },
      { heading: 'A backup is not a tested restoration', body: 'Google’s retrieved public disaster-recovery template asks for dependency ordering, automated and manual failover tasks, and step-by-step restoration and rebuild instructions. State how much data loss and downtime the product can tolerate, then rehearse recovery and measure the result. A replica is not a substitute for an independent backup when accidental deletion or corruption is replicated.' },
    ],
    example: 'Reading reference: Amazon Builders’ Library on static stability using Availability Zones. The three-zone calculation is an original planning exercise, not an AWS service guarantee.',
    takeaway: 'A recovery plan must work under the failures it claims to recover from.',
    sources: sources('amazon-static-stability', 'google-recovery'),
    exercise: { prompt: 'A service receives 6,000 requests/sec across three equal zones and must survive losing one.', checkpoints: ['Calculate 2,000 requests/sec per zone normally and 3,000 on each survivor.', 'List shared dependencies that could invalidate the capacity calculation.', 'Name recovery actions that would require an impaired control plane.'] },
  },
  {
    id: 'live-event-fanout', title: 'Live-event PubSub & reaction streams', icon: '≋', minutes: 13, level: 'Advanced',
    summary: 'Reason about long-lived connections, slow consumers, and enormous fan-out.',
    sections: [
      { heading: 'Connections are not message throughput', body: 'A million open sockets and a million messages per second are different workloads. Broadcasting 10 events per second to a million subscribers implies up to 10 million deliveries per second before retries and protocol overhead. Partition connection ownership and event distribution deliberately.' },
      { heading: 'Give slow consumers a policy', body: 'A client can stop reading while the producer keeps publishing. Bound buffers and choose whether to disconnect, coalesce, sample, or replay according to product semantics. Dropping redundant reaction updates may be acceptable; silently dropping a purchase acknowledgement is not.' },
      { heading: 'Plan reconnects and aggregation', body: 'A regional disconnect can trigger synchronized reconnections and authentication load. Use randomized reconnect backoff, resumable cursors where suitable, and explicit replay limits. For reactions, aggregate by time window if the product needs trends rather than every individual event; document freshness and loss tolerance.' },
    ],
    example: 'Historical Hotstar PubSub and emoji articles are suggested reading references associated with Jio-related streaming learning. Their bodies could not be retrieved. This lesson is an original generic design exercise, not a description of Reliance Jio telecom or a current JioHotstar implementation.',
    takeaway: 'Define delivery semantics and backpressure before multiplying events by the subscriber count.',
    sources: sources('hotstar-pubsub', 'hotstar-reactions'),
    exercise: { prompt: 'A live match needs essential playback plus optional audience reactions during a large spike.', checkpoints: ['Calculate event fan-out separately from connected users.', 'Set bounded buffers and a slow-consumer policy for each message class.', 'Describe randomized reconnects and which aggregates can tolerate loss or staleness.'] },
  },
]
