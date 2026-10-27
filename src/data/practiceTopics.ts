import type { Topic } from '../types.ts'

export const practiceTopics: Topic[] = [
  {
    id: 'rate-limiting', title: 'Rate limiting & caller fairness', icon: '◴', minutes: 11, level: 'Intermediate',
    summary: 'Allocate a finite request budget without confusing identity, bursts, and capacity.',
    sections: [
      { heading: 'Choose a budget and an identity', body: 'A rate limit bounds admitted work over time. Scope the budget to a verified account, tenant, or API credential rather than a caller-supplied tenant header. IP limits can help before authentication, but shared networks combine unrelated users and address rotation can evade them. Trust forwarded addresses only from configured proxies.' },
      { heading: 'Allow bursts deliberately', body: 'A token bucket refills at a chosen rate and stores up to a fixed capacity. A full bucket with capacity 60 and refill rate 10 tokens per second admits a burst of 60 unit-cost requests, then roughly 10 per second. Assign higher costs to expensive operations; a request count alone does not measure CPU or database work.' },
      { heading: 'Make distributed decisions explicit', body: 'Independent per-replica buckets multiply the effective allowance when traffic moves between replicas. A shared atomic counter or bucket provides tighter coordination but adds latency and a dependency. Leased local budgets reduce coordination at the cost of bounded overshoot. Expire inactive identities so attacker-created keys cannot grow state without limit.' },
      { heading: 'Separate fairness from overload protection', body: 'A caller within quota can still reach a saturated service. Pair rate limits with bounded concurrency and queueing. Return a documented rejection such as HTTP 429 with useful retry guidance. If the limiter fails, choose fail-open or fail-closed by operation risk; bypassing a login-attempt limit has different consequences from delaying a public catalog read.' },
    ],
    example: 'An original report API exercise: each verified workspace shares one budget across all API keys, while expensive exports consume more tokens than metadata reads.',
    takeaway: 'A useful limit names its trusted identity, cost model, coordination boundary, and failure policy.',
    exercise: { prompt: 'Design a workspace report API with three replicas, occasional bursts, and expensive export requests.', checkpoints: ['Define trusted caller identity and prevent API-key rotation from resetting the workspace budget.', 'Choose bucket capacity, refill rate, and export cost; explain the admitted burst.', 'Describe replica coordination, limiter failure behavior, and overload protection.'] },
  },
  {
    id: 'pagination-indexes', title: 'Cursor pagination & query indexes', icon: '▥', minutes: 12, level: 'Intermediate',
    summary: 'Make large listings predictable while preserving query scope and access control.',
    sections: [
      { heading: 'Give every row a stable position', body: 'Ordering only by creation time is ambiguous when timestamps tie. Use a total order such as created_at descending, then unique id descending. A keyset query seeks rows after the last returned pair rather than skipping a growing offset. Inserts before the cursor do not shift that boundary, but changing sort fields can still move rows between pages.' },
      { heading: 'Match the index to the query', body: 'For a workspace listing filtered by status, an index beginning with workspace_id and status followed by created_at and id can support the equality filters and ordered seek. Verify the execution plan with realistic data. Extra indexes cost storage and write work; a different filter or sort order may need a different plan.' },
      { heading: 'A cursor is not permission', body: 'Encode the last sort key and bind the cursor to its filters and scope; authenticate its contents or keep server-side state to reject tampering. An opaque encoding alone is not protection. Recheck authorization and apply tenant and visibility filters in every page query. Permission changes must not expose rows merely because a previously issued cursor remains valid.' },
      { heading: 'Choose a consistency contract', body: 'Keyset pagination is efficient but does not automatically produce a point-in-time snapshot. Deletions and updates can change later pages. If an export requires a fixed dataset, use a supported snapshot or a materialized export with a defined lifetime. Bound page sizes and cursor lifetimes; avoid exposing sensitive sort values in plain cursor payloads.' },
    ],
    example: 'An original moderation queue uses WHERE workspace_id = ? AND status = ? plus a descending seek on (created_at, id), returning a cursor for the last visible row.',
    takeaway: 'Stable ordering, a matching index, and authorization on every page solve different parts of pagination.',
    exercise: { prompt: 'Design a paginated private incident list with repeated timestamps and changing workspace membership.', checkpoints: ['Specify the total ordering, seek predicate, and a matching index.', 'Bind the cursor to the query and reapply authorization for every page.', 'Explain what concurrent inserts, edits, and revoked membership mean for the listing.'] },
  },
  {
    id: 'transaction-boundaries', title: 'Transactions & external side effects', icon: '⇄', minutes: 13, level: 'Advanced',
    summary: 'Locate the atomic boundary before coordinating database writes and remote work.',
    sections: [
      { heading: 'Protect the business invariant', body: 'A transaction makes its participating database changes commit together or roll back together. Atomicity alone does not prevent concurrent transactions from both approving the same limited resource. Use an appropriate isolation level, lock, uniqueness constraint, or conditional update. For a seat reservation, require the availability change to succeed before recording a confirmed booking in the same transaction.' },
      { heading: 'A remote call is outside the commit', body: 'Sending an email or charging a remote payment service inside application transaction code does not enlist that service in the database transaction. A rollback cannot unsend the email. Keeping locks while waiting on a network call also increases contention. Model pending and completed states rather than implying that one local commit makes every external effect atomic.' },
      { heading: 'Publish intent with an outbox', body: 'Write the business change and an outbox record in one database transaction. A relay reads committed records and publishes them. A crash after publication but before marking delivery can cause duplicates, so consumers need a stable event identity and deduplication coupled atomically to their own local effects. The outbox closes the commit-to-publication gap, not every delivery gap.' },
      { heading: 'Recover the workflow honestly', body: 'For remote payment, use a provider-supported idempotency key and reconcile unknown outcomes before retrying with a new identity. Compensation is a new business action, such as a refund, not a rollback of history. Restrict which producers and consumers can access outbox payloads, and keep secrets and unnecessary personal data out of events.' },
    ],
    example: 'An original workshop booking commits a pending reservation and PaymentRequested outbox record together; a worker reconciles the provider result before confirming or releasing the seat.',
    takeaway: 'State exactly what commits atomically and make everything beyond that boundary recoverable.',
    exercise: { prompt: 'A reservation commits, but the worker crashes after the payment provider accepts a charge.', checkpoints: ['Identify the local invariant and the transaction that includes its outbox record.', 'Specify stable event and payment identities for duplicate delivery and unknown outcomes.', 'Describe reconciliation, seat release or refund rules, and access to sensitive payloads.'] },
  },
  {
    id: 'event-log-projections', title: 'Event logs & rebuildable projections', icon: '≡', minutes: 13, level: 'Advanced',
    summary: 'Derive useful read models without assuming replay, ordering, or duplicates are free.',
    sections: [
      { heading: 'Separate facts from read models', body: 'An event log records accepted facts; a projection derives a query-friendly view from them. A shipment history might drive a current-status table and a daily totals view. Those views may lag behind the authoritative write path. Show freshness where it matters, and do not use a delayed projection alone to approve an invariant-sensitive action.' },
      { heading: 'Define ordering where it exists', body: 'Partitioning by shipment can preserve order for that shipment without establishing global order across all shipments. Track per-entity versions or partition positions. If version 12 arrives before 11, buffer, retry, or repair according to a documented policy; sorting by wall-clock timestamps does not restore causality when clocks disagree.' },
      { heading: 'Commit progress with the effect', body: 'Updating a projection and then crashing before saving its checkpoint can replay the update. Save the checkpoint or deduplication identity atomically with the local projection write where possible. Parallel workers must not advance a contiguous checkpoint past unfinished earlier events. External side effects require their own idempotency plan; replaying a read model should not resend every notification.' },
      { heading: 'Rebuild without exposing half a view', body: 'Build a versioned projection alongside the live one, replay retained events, catch up, validate, and switch reads at a defined boundary. Budget replay load so it does not starve live consumers. Plan event-schema evolution, retention, and personal-data deletion: an append-only history is not permission to retain sensitive data forever or expose it to every consumer.' },
    ],
    example: 'An original parcel tracker rebuilds a new status projection while the old one serves reads, then compares per-partition progress and sample results before switching.',
    takeaway: 'A projection is safely rebuildable only when ordering, progress, schema evolution, and replay effects are explicit.',
    exercise: { prompt: 'Rebuild a shipment-status view while live events continue and consumers occasionally redeliver records.', checkpoints: ['Define the partition key, entity version checks, and policy for missing or duplicate events.', 'Couple projection updates to progress and keep replay from repeating external effects.', 'Plan catch-up, validation, cutover, and sensitive-data retention.'] },
  },
  {
    id: 'realtime-delivery', title: 'Realtime delivery & resumable sessions', icon: '⌁', minutes: 12, level: 'Advanced',
    summary: 'Design live updates around authorization, bounded buffers, and reconnect gaps.',
    sections: [
      { heading: 'Choose the smallest useful transport', body: 'Server-sent events fit one-way server updates; WebSockets support bidirectional messages. Neither transport provides durable delivery by itself. Separate connection ownership from the event source so reconnecting to a different gateway does not lose all history. Estimate open connections, event rate, fan-out, and buffer memory separately.' },
      { heading: 'Authorize subscriptions, not just sockets', body: 'Authenticate the connection and authorize each channel or resource subscription. Validate browser origins where relevant and defend cookie-authenticated connections against cross-site abuse. A valid session must not grant access to arbitrary tenant channels. Expiring credentials or revoked membership need a revalidation or disconnect policy, including checks before replaying retained private events.' },
      { heading: 'Resume from an explicit position', body: 'Give ordered events stable sequence positions and let clients acknowledge the last applied position. On reconnect, authorize again and replay after that position within a bounded retention window. Clients should ignore duplicates. If the cursor is too old, return an explicit resync instruction and obtain a fresh snapshot with a defined event boundary rather than silently skipping the gap.' },
      { heading: 'Bound slow consumers and recovery storms', body: 'A stalled reader cannot have an unlimited outbound queue. Coalesce replaceable status updates or disconnect and resume for durable ordered messages. Apply per-connection and per-tenant limits. Randomized exponential reconnect backoff spreads authentication and replay load after an outage; reserve enough capacity for recovery as well as steady-state traffic.' },
    ],
    example: 'An original dispatch board loads a snapshot at sequence 420 and then applies authorized events after 420; an expired replay window requires a new snapshot.',
    takeaway: 'A live connection is a transport; secure subscription and recovery semantics are separate contracts.',
    exercise: { prompt: 'Design a private dispatch board that must recover after a ten-minute regional connection outage.', checkpoints: ['Choose a transport and enforce channel authorization, token expiry, and membership revocation.', 'Define snapshot boundaries, acknowledgement positions, duplicate handling, and expired-cursor recovery.', 'Bound outbound buffers and spread reconnect and replay load.'] },
  },
  {
    id: 'geo-routing', title: 'Geo routing, data placement & failover', icon: '⊕', minutes: 13, level: 'Advanced',
    summary: 'Route requests near users without losing track of who may store data or accept writes.',
    sections: [
      { heading: 'Network proximity is not data authority', body: 'Latency-aware or geographic routing can send a user to a nearby healthy endpoint, but that endpoint may not own the requested data. DNS answers can remain cached and client network location can differ from account residence. Resolve tenant placement using trusted account metadata, then route to an authorized data region; do not let an arbitrary client header choose residency.' },
      { heading: 'Choose the write and replication model', body: 'A home-region writer simplifies conflict handling but adds latency for distant users. Asynchronous replicas provide nearby reads with lag and possible data loss if the writer is lost. Synchronous cross-region coordination can reduce that loss window but increases write latency and may sacrifice availability during partitions. State recovery-point and recovery-time objectives instead of promising instant lossless failover.' },
      { heading: 'Fence the old writer before promotion', body: 'A health-check failure cannot prove the old region has stopped accepting writes. Promotion needs an authority mechanism, such as a quorum-issued epoch, with storage enforcing rejection of stale writer tokens. Merely changing DNS does not fence an old writer. If safe ownership cannot be established during a partition, refusing writes can be safer than creating conflicting histories.' },
      { heading: 'Rehearse routing and data recovery together', body: 'A failover target needs data, capacity, keys, authorization services, and compatible configuration. Verify that backups and replicas obey placement constraints. Measure replica lag before promotion and reconcile any missing or conflicting operations. Returning to the original region is another controlled ownership transfer, not just a DNS reversal; test cached clients and in-flight requests during both directions.' },
    ],
    example: 'An original regional records service keeps each tenant in an approved region pair, serves permitted replica reads, and blocks writes until a promoted writer holds a storage-enforced epoch.',
    takeaway: 'Geo routing selects an endpoint; placement policy and fenced write authority determine whether it can safely serve the request.',
    exercise: { prompt: 'Design regional failover for private tenant records with a five-minute data-loss budget and restricted storage locations.', checkpoints: ['Map tenant placement, permitted replicas, read freshness, and routing behavior for distant users.', 'Choose replication and calculate whether observed lag meets the recovery-point objective.', 'Define promotion authority, stale-writer fencing, cached-client behavior, and safe failback.'] },
  },
]
