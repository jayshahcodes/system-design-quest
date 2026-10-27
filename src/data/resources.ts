import type { LearningResource } from '../types.ts'
import { practiceResources } from './practiceResources.ts'

const referenceNote = 'Reading reference only: the article body could not be retrieved in this environment. The guide contains general design questions, not a verified account of the article’s implementation details. Link availability is not monitored.'
const retrievedNote = 'The public project README was retrieved during curation on 2026-10-27. The summary describes that documentation, not a live production deployment; link availability is not monitored.'
const hotstarNote = 'Historical Hotstar engineering reference discovered through a public reading-list citation; the article body could not be retrieved. Grouped with Jio-related streaming learning, not attributed to Reliance Jio telecom or presented as a current JioHotstar blueprint.'

export const resources: LearningResource[] = [
  {
    id: 'netflix-concurrency', title: 'Concurrency Limits', url: 'https://github.com/Netflix/concurrency-limits',
    publisher: 'Netflix', attribution: 'Netflix public project documentation; not a claim about every Netflix service.',
    kind: 'Project documentation', level: 'Advanced', concepts: ['Admission control', 'Queueing', 'Latency'],
    summary: 'A retrieved engineering reference on adapting the number of in-flight requests using congestion-control ideas and latency measurements.',
    takeaways: [
      'The README distinguishes concurrent requests from requests per second and relates average concurrency to throughput and latency.',
      'It documents delay-based limit algorithms and rejecting excess work before resource exhaustion.',
      'It describes traffic partitions that can reserve a share of concurrency for different request groups.',
    ],
    discussion: 'If average request duration rises while arrival rate stays constant, what happens to in-flight work? Which metrics would tell you when to reject new requests?',
    topicIds: ['adaptive-concurrency', 'overload-control', 'load-balancing', 'performance'], verification: 'retrieved', verificationNote: retrievedNote,
  },
  {
    id: 'netflix-hystrix', title: 'Hystrix: latency and fault tolerance', url: 'https://github.com/Netflix/Hystrix',
    publisher: 'Netflix', attribution: 'Netflix historical open-source documentation. Hystrix is in maintenance mode, not a recommendation for new adoption.',
    kind: 'Project documentation', level: 'Advanced', concepts: ['Fault isolation', 'Circuit breakers', 'Graceful degradation'],
    summary: 'A retrieved historical reference for isolating remote dependencies and containing cascading failures.',
    takeaways: [
      'The README describes thread/semaphore isolation, circuit breakers, fallbacks, and failing fast.',
      'It explicitly states that Hystrix is no longer actively developed and discusses more adaptive approaches.',
      'The patterns remain worth studying separately from a decision to adopt the historical library.',
    ],
    discussion: 'Which dependency can fail without blocking the main product action? What should its fallback return, and how will you know the fallback is masking a prolonged outage?',
    topicIds: ['fault-isolation', 'adaptive-concurrency'], verification: 'retrieved', verificationNote: retrievedNote,
  },
  {
    id: 'netflix-performance', title: 'Performance Under Load', url: 'https://medium.com/@NetflixTechBlog/performance-under-load-3e6fa9a60581',
    publisher: 'Netflix', attribution: 'Netflix TechBlog article linked from the retrieved Hystrix README.',
    kind: 'Engineering article', level: 'Advanced', concepts: ['Admission control', 'Queueing', 'Latency'],
    summary: 'A further reading reference for investigating performance under saturation. The article itself was not fetched; use the companion concurrency documentation for the verified project details.',
    takeaways: [
      'Reading goal: compare limiting arrival rate with limiting in-flight requests.',
      'Reading goal: examine how a growing queue changes latency and resource consumption.',
      'Design exercise: decide which traffic can be rejected or degraded before the service becomes unresponsive.',
    ],
    discussion: 'Draw a latency-versus-load curve. Where would you set an admission boundary, and what evidence would justify changing it?',
    topicIds: ['adaptive-concurrency', 'overload-control'], verification: 'reference-only', verificationNote: referenceNote,
  },
  {
    id: 'amazon-retries', title: 'Timeouts, retries, and backoff with jitter', url: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/',
    publisher: 'Amazon / AWS', attribution: 'Amazon Builders’ Library; general reliability guidance, not a universal configuration recipe.',
    kind: 'Engineering guide', level: 'Intermediate', concepts: ['Retries', 'Timeouts', 'Overload'],
    summary: 'A reading guide for designing bounded retries and spreading retry traffic instead of amplifying an outage.',
    takeaways: [
      'Design principle: a timeout does not prove that the remote side effect never happened.',
      'Design principle: retries consume capacity; coordinate a retry budget across the call chain.',
      'Reading goal: compare deadlines, exponential backoff, and randomized jitter for recovery behavior.',
    ],
    discussion: 'Three service layers each allow three total attempts. How many calls might reach the deepest dependency, and which layer should own retries?',
    topicIds: ['retry-budgets', 'queues', 'overload-control'], verification: 'reference-only', verificationNote: referenceNote,
  },
  {
    id: 'amazon-idempotency', title: 'Making retries safe with idempotent APIs', url: 'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/',
    publisher: 'Amazon / AWS', attribution: 'Amazon Builders’ Library; the in-app order workflow is a proposed exercise.',
    kind: 'Engineering guide', level: 'Advanced', concepts: ['Idempotency', 'Retries', 'Transactions'],
    summary: 'A reference for distinguishing a new operation from a repeated attempt and preserving correctness when a caller cannot tell whether a request succeeded.',
    takeaways: [
      'Design principle: bind an operation token to the caller’s intent, not just a transport attempt.',
      'Design principle: a deduplication record and the side effect need an atomic or recoverable relationship.',
      'Reading goal: reason about token reuse, different payloads, and requests that arrive after the retention window.',
    ],
    discussion: 'An order is committed but its response is lost. Specify the result of retrying the same token, using it with a different payload, and retrying after token expiry.',
    topicIds: ['idempotent-workflows', 'queues'], verification: 'reference-only', verificationNote: referenceNote,
  },
  {
    id: 'amazon-static-stability', title: 'Static stability using Availability Zones', url: 'https://aws.amazon.com/builders-library/static-stability-using-availability-zones/',
    publisher: 'Amazon / AWS', attribution: 'Amazon Builders’ Library; cloud-specific vocabulary is used to discuss a broader failure-domain principle.',
    kind: 'Engineering guide', level: 'Advanced', concepts: ['Failure domains', 'Capacity planning', 'Recovery'],
    summary: 'A reference for considering whether surviving resources can serve essential traffic without depending on emergency provisioning.',
    takeaways: [
      'Design principle: recovery may fail if it requires a control plane that is itself impaired.',
      'Design exercise: reserve headroom for losing a failure domain instead of relying exclusively on scale-out after failure.',
      'Reading goal: identify data-plane dependencies and test the assumptions behind failover capacity.',
    ],
    discussion: 'A three-zone service loses one zone. What load must each survivor carry, and what would break if creating replacement servers were unavailable?',
    topicIds: ['failure-domains', 'load-balancing'], verification: 'reference-only', verificationNote: referenceNote,
  },
  {
    id: 'google-slos', title: 'Service Level Objectives', url: 'https://sre.google/sre-book/service-level-objectives/',
    publisher: 'Google', attribution: 'Google’s public Site Reliability Engineering book; a published guide, not a complete description of Google infrastructure.',
    kind: 'Engineering guide', level: 'Intermediate', concepts: ['SLOs', 'Observability', 'Reliability'],
    summary: 'A guide to studying user-centered reliability measures before choosing components or promising an availability percentage.',
    takeaways: [
      'Design principle: distinguish a measured indicator, an objective for it, and an external agreement.',
      'Design principle: specify the population, time window, and definition of a good event.',
      'Reading goal: use an error budget to discuss reliability work and release risk rather than chasing an unqualified uptime number.',
    ],
    discussion: 'Would a fast HTTP 200 response count as success if playback never starts? Define a user-centered indicator and its measurement window.',
    topicIds: ['slo-design', 'performance'], verification: 'reference-only', verificationNote: referenceNote,
  },
  {
    id: 'google-overload', title: 'Handling Overload', url: 'https://sre.google/sre-book/handling-overload/',
    publisher: 'Google', attribution: 'Google’s public Site Reliability Engineering book. Exercise thresholds are illustrative, not Google settings.',
    kind: 'Engineering guide', level: 'Advanced', concepts: ['Overload', 'Admission control', 'Graceful degradation'],
    summary: 'A reference for exploring bounded queues, prioritization, and rejecting excess work while protecting useful throughput.',
    takeaways: [
      'Design principle: an unbounded queue can turn a temporary spike into prolonged latency and resource exhaustion.',
      'Design exercise: reserve resources for critical work and define which optional work can be shed.',
      'Reading goal: connect capacity limits, overload feedback, and client retry behavior.',
    ],
    discussion: 'When playback and recommendation traffic compete, which requests should receive scarce capacity and how should rejected clients retry?',
    topicIds: ['overload-control', 'fault-isolation'], verification: 'reference-only', verificationNote: referenceNote,
  },
  {
    id: 'aws-sdk-retries', title: 'AWS SDK for Go v2: retry behavior', url: 'https://github.com/aws/aws-sdk-go-v2/blob/main/aws/retry/doc.go',
    publisher: 'Amazon / AWS', attribution: 'Official AWS SDK package documentation; implementation-specific supporting evidence, not the Builders’ Library article body.',
    kind: 'Project documentation', level: 'Intermediate', concepts: ['Retries', 'Timeouts', 'Overload'],
    summary: 'Retrieved implementation documentation that makes retry limits, retry eligibility, cancellation, and rate limiting concrete.',
    takeaways: [
      'The documented standard retryer has a configurable maximum attempt count.',
      'It uses a token bucket to rate-limit retry attempts and a delay policy between attempts.',
      'A canceled request context is not automatically retried; this is distinct from deciding whether a remote side effect occurred.',
    ],
    discussion: 'How do your user deadline, SDK attempt limit, retry token budget, and application-level retry loop interact?',
    topicIds: ['retry-budgets', 'overload-control'], verification: 'retrieved',
    verificationNote: 'Official AWS SDK retry package documentation was retrieved during curation on 2026-10-27. It supports the SDK-specific facts here, not unverified details of a separate blog article. Link availability is not monitored.',
  },
  {
    id: 'google-recovery', title: 'Disaster recovery instructions: service documentation template', url: 'https://github.com/google/opendocs/blob/master/service_docs/templates/disaster_recovery.md',
    publisher: 'Google', attribution: 'Google public service-documentation template; guidance for writing a runbook, not a production deployment description.',
    kind: 'Project documentation', level: 'Advanced', concepts: ['Failure domains', 'Recovery', 'Observability'],
    summary: 'A retrieved primary template for documenting dependency ordering, failover, backup restoration, and rebuilding a service after catastrophic loss.',
    takeaways: [
      'The template asks authors to consider losing an entire office or datacenter.',
      'It separates automated failover behavior from manual tasks and asks which services must be restored first.',
      'It asks for usable backup, restore, and rebuild instructions rather than merely stating that backups exist.',
    ],
    discussion: 'Could an on-call engineer unfamiliar with your service restore it from this runbook? List the credentials, dependencies, and recovery evidence they would need.',
    topicIds: ['failure-domains', 'slo-design'], verification: 'retrieved',
    verificationNote: 'Google’s public disaster-recovery template was retrieved during curation on 2026-10-27. Its date placeholder is not treated as a publication date. Link availability is not monitored.',
  },
  {
    id: 'hotstar-pubsub', title: 'Building PubSub for 50M concurrent socket connections', url: 'https://blog.hotstar.com/building-pubsub-for-50m-concurrent-socket-connections-5506e3c3dabf',
    publisher: 'Jio ecosystem', attribution: 'Historical Hotstar engineering publication; Jio-related streaming context only. Not a Reliance Jio telecom article or a verified current JioHotstar architecture.',
    kind: 'Engineering article', level: 'Advanced', concepts: ['Live events', 'PubSub', 'Backpressure'],
    summary: 'A historical reading reference for reasoning about many long-lived connections and fan-out. The number in the article title is not an app benchmark or a capacity promise.',
    takeaways: [
      'Reading goal: distinguish connected sockets from message rate and fan-out deliveries.',
      'Design exercise: separate connection handling from event distribution and bound each subscriber buffer.',
      'Design exercise: define slow-consumer, reconnect, ordering, and replay policies explicitly.',
    ],
    discussion: 'One event reaches a million subscribers. How do you keep a slow client from forcing an unbounded buffer, and what happens when many clients reconnect together?',
    topicIds: ['live-event-fanout', 'queues'], verification: 'reference-only', verificationNote: hotstarNote,
  },
  {
    id: 'hotstar-reactions', title: 'Capturing a Billion Emojis', url: 'https://blog.hotstar.com/capturing-a-billion-emojis-62114cc0b440',
    publisher: 'Jio ecosystem', attribution: 'Historical Hotstar engineering publication, grouped as Jio-related streaming reading rather than attributed to Jio telecom.',
    kind: 'Engineering article', level: 'Advanced', concepts: ['Live events', 'Aggregation', 'Backpressure'],
    summary: 'A historical reading reference for exploring high-volume audience reactions. The lesson proposes aggregation trade-offs without claiming to reproduce the unavailable article’s implementation.',
    takeaways: [
      'Design exercise: decide whether the product needs every reaction delivered individually or only aggregate trends.',
      'Design exercise: choose time windows, freshness, and tolerated loss for noncritical reaction counters.',
      'Reading goal: compare ingestion rate with the much larger cost of broadcasting each event to every viewer.',
    ],
    discussion: 'Can a reaction counter be approximate while a payment counter cannot? Explain how that difference changes retries, storage, and fan-out.',
    topicIds: ['live-event-fanout', 'graph-feeds'], verification: 'reference-only', verificationNote: hotstarNote,
  },
  ...practiceResources,
]
