# System Design Quest

An interactive system design learning platform, from beginner foundations to advanced trade-offs. Learn concepts and public engineering case studies, practice with short quizzes, and build architectures through guided design quests.

## Run locally

Requires **Node.js 22.18+** and npm. No backend, accounts, API keys, or environment variables are needed.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

```sh
npm run lint     # Oxlint
npm test         # Node's built-in test runner; no extra test dependencies
npm run build    # TypeScript checks and production bundle in dist/
npm run preview  # Serve the production bundle locally
```

## Features

- **Learn:** 27 lessons across Beginner, Intermediate, and Advanced levels. The existing 21 lessons are preserved, with six original additions on rate limiting, pagination/indexes, transaction boundaries, event-log projections, realtime delivery, and geo routing. Extensions include design exercises and reasoning checkpoints.
- **Engineering resource library:** 16 curated references grouped by Netflix, Jio-related streaming, Amazon / AWS, Google, SystemDesign.io, and Fanout. Search titles, summaries, attribution, concepts, and takeaways; combine publisher and concept filters; expand reading guides and open related lessons directly.
- **Quiz:** 54 topic-mapped concept/scenario MCQs. Practice one topic or all topics, check answers with explanations, advance, and review your final score.
- **Visual Design Game:** add ten component types, including NoSQL DB, Object Storage, CDN, and Worker. Drag a library block onto the board, move nodes by their drag handle, and follow directed SVG connections. Click-to-add, keyboard movement, and editor X/Y coordinates provide non-drag alternatives.
- **Technology choices:** compare curated popular tools such as PostgreSQL/MySQL, Redis/Memcached, MongoDB/DynamoDB, Kafka/RabbitMQ, Nginx/HAProxy, and object-storage/CDN options. Selections are learning annotations with trade-off descriptions, not integrations, endorsements, or rankings.
- **Configure the system:** edit names, types, replicas (1–100), per-replica illustrative capacity (1–100,000), database shards (1–128), cache TTL (0–86,400 seconds) and policy, or stateless server/worker behavior. Type changes reset incompatible settings.
- **Ten progressive quests:** the existing seven quests plus an Easy durable catalog, Medium durable notifications, and Hard event-driven read-model rebuild. New quests use existing components, settings, validation, and per-task persistence.
- **Actionable validation:** pass/fail and a requirements-met breakdown. Required settings and directed connections must be reachable through the task's required topology; disconnected configured blocks cannot satisfy the newer configuration rules.
- **Flow explorer:** choose an entry component and illustrative request rate, trace the reachable directed edges, and step forward/backward to highlight a connection and its endpoints. Compare the rate to each target's configured replica capacity; disconnected nodes and capped traces are reported.
- **Local persistence:** boards, positions, and settings save independently per task and survive reloads. Existing Phase 1 boards still load with default positions/settings. Reset Task clears only the selected board after confirmation. Missing/corrupt saved boards fall back to empty; storage write failures display a warning and do not stop play.
- Responsive layout, keyboard-operable controls, labeled inputs, and helpful empty states.

### Try a first quest

1. Open **Design Game** and choose **Serve your first website**.
2. Add a **Client** and an **App Server**.
3. Under Connections, choose Client as **From** and App Server as **To**, then **Connect**.
4. Select **Run Validation**. The three requirements should pass.
5. Try the next task: put a Load Balancer between the client and server, and edit the connected App Server to use at least two replicas.

### Explore beyond the first quest

- Drag blocks from the component library onto the architecture surface; use the handle to reposition them. Use arrow keys on the focused handle or edit X/Y coordinates when using a keyboard or touch device.
- Edit a SQL/NoSQL block to choose a database and change shard count. Edit Cache for TTL/policy, or App Server/Worker for capacity and stateless behavior.
- Connect nodes using the **From / To** form. Trace the request path from a selected source and step through the directed edges; then increase the offered rate or replica capacity and compare the illustrative overload indicators.
- Move from Easy to Medium/Hard tasks using the task selector. Hints and rule labels describe the required topology and configuration.

**Scope:** Validation checks educational structure/settings, not production readiness. The flow explorer is a breadth-first traversal, **not a discrete-event traffic simulator**: every reachable edge gets the same illustrative rate; load-balancer splitting, cache hit/miss rates, TTL expiration, shard routing, queue scheduling, latency, consistency, and failures are not simulated. A target's capacity is simply replicas × configured capacity, not a benchmark for the chosen tool. Cycles are visited finitely and traces display at most 200 edges. “10,000 users” is a learning scenario, not a measured capacity guarantee. App Server also represents a simple static file server in the first quest.

### Public case studies

Lessons link to Netflix's Open Connect overview, the Google Spanner paper, the Vitess project (which originated at YouTube), Meta's TAO paper, and Twitter's archived Snowflake project. They distinguish published/historical designs from proposed learning exercises. These sources describe specific contexts and points in time; the game does not reproduce those companies' current internals. External source availability is outside this app.

### Engineering reading paths

The resource library adds:

- **Netflix:** retrieved Concurrency Limits and historical Hystrix documentation, plus the *Performance Under Load* reading reference. Explore admission control, queueing, fault isolation, and safe degradation. Hystrix is explicitly marked as maintenance-mode historical material, not a recommendation for new adoption.
- **Amazon / AWS:** Builders’ Library references for timeouts/retries/jitter, idempotent APIs, and static stability, plus retrieved AWS SDK retry documentation. Practice retry amplification, ambiguous outcomes, duplicate operations, and failure-domain capacity.
- **Google:** SRE reading references for service-level objectives and handling overload, plus a retrieved public disaster-recovery documentation template. Define good events, error budgets, shedding policies, dependencies, and usable restoration procedures.
- **Jio-related streaming:** two **historical Hotstar** engineering references on PubSub and audience reactions. These are not attributed to Reliance Jio telecommunications, and they are not presented as verified descriptions of current JioHotstar infrastructure. The live-event lesson is an original exercise about fan-out, reconnects, and slow-consumer policies.

**Curation limits:** direct blog/SRE-site retrieval failed in the implementation environment. Four primary documentation sources were retrieved through GitHub during curation on 2026-10-27: Netflix Concurrency Limits, Netflix Hystrix, AWS SDK retry package documentation, and Google's disaster-recovery template. Those entries are labeled **Retrieved for curation**. The other eight entries are labeled **Reference only · not retrieved**, with explicit notes; their guides contain general design principles, reading goals, and original exercises rather than claims about unavailable article details. Hotstar URLs were discovered through public reading-list citations, not primary-page retrieval. No publication dates, current production claims, or numerical benchmarks are inferred from titles. This is a curated starting library, not an exhaustive catalog or a live link checker.

### Add learning resources

Add a record to `src/data/resources.ts` with its publisher group, actual attribution, kind, level, concepts, original summary, reading takeaways, discussion prompt, related topic IDs, and retrieval status/note. Add lessons in `src/data/reliabilityTopics.ts` and questions in `src/data/reliabilityQuestions.ts` (or the existing content modules). Each lesson currently has one concept and one scenario question. Keep exercises separate from claims about source systems, and update retrieval notes only after actually reviewing the primary material.

### Original systems practice and suggested directories

The user-suggested [SystemDesign.io](https://systemdesign.io), [Fanout overview](https://fanout.sh/system/overview), [Fanout systems](https://fanout.sh/system/systems), and [Fanout case studies](https://fanout.sh/system/case-studies) are available as external resource cards. All four failed DNS lookup in the implementation environment on 2026-10-27. Their content, syllabus, and current availability were **not verified**; this is not evidence that they are unavailable to other readers. The four additions are reference-only, bringing the library to four retrieved references and twelve reference-only entries.

No articles, diagrams, exercises, or solutions were imported or mirrored. The six new lessons, twelve questions, and three quests are independently written to address gaps in this app's existing curriculum, not asserted coverage gaps in either external site. There is no claimed affiliation, completeness, or company-specific architecture verification. If the pages become accessible, review their public coverage before describing any overlap; do not change retrieval labels based only on URLs.

Start with **Browse a durable catalog**, then **Deliver durable notifications**, and finally **Rebuild an event-driven read model**. Read the pagination, transaction, and projection lessons alongside them. The notification and projection diagrams abstract an outbox publisher into App Server; adding an App Server → Queue edge does not make a database/queue dual write atomic. Queue represents transport, not a guaranteed permanent replay log. Authorization, idempotency, cursor correctness, ordering, retention, replay cutover, and regional failover remain reasoning exercises, not capabilities verified by the topology checker.

Boards stay in this browser/origin under `system-design-quest:board:v1:<task-id>` localStorage keys. They are not synced or backed up, so avoid storing sensitive information. Quiz progress resets when leaving Quiz or reloading.

## Project structure

```text
src/
  App.tsx              Navigation and app shell
  components/          Learn, Quiz, and DesignGame sections
    ArchitectureCanvas.tsx  Drag/drop nodes, keyboard movement, and directed edges
    FlowPanel.tsx       Traversal controls and step-by-step flow explanations
    ResourceLibrary.tsx Searchable reading guides and related lesson navigation
    shared/            Reusable buttons, badges, headers, fields, and options
  constants.ts         UI copy, icons, navigation, and copy formatters
  gameConstants.ts     Playground copy and flow/configuration labels
  resourceConstants.ts Resource-library labels and exercise copy
  data/                Topics, quizzes, resources, tasks, and technology catalog
    practiceTopics.ts  Original intermediate/advanced systems lessons
    practiceQuestions.ts  Paired concept and scenario questions
    practiceResources.ts  User-suggested directories and explicit retrieval limits
    practiceTasks.ts   Catalog, notification, and projection topology exercises
  lib/architecture.ts  Default settings and legacy node placement
  lib/flow.ts          Bounded, cycle-safe directed request traversal
  lib/resources.ts     Pure resource filtering and filter-option helpers
  lib/storage.ts       Defensive board parsing and localStorage access
  lib/validation.ts    Pure data-driven task evaluation
  types.ts             Shared content, board, task, and result interfaces
  index.css            Tailwind integration and responsive styles
  game.css             Visual playground and flow styling
  resource.css         Responsive reading library and exercise styling
tests/                 Content, validation, persistence, copy, and JSX convention tests
```

The app uses React, TypeScript, Vite, and Tailwind CSS, with a simple single-page navigation structure. Add lessons/questions in `src/data/`; add tasks using the existing component/connection rule types. New rule kinds belong in `TaskRule` and the validator. `npm test` exercises the pure modules directly using Node's TypeScript stripping.

## Next phases

- More tasks: messaging, multi-region failover, and explicit security invariants.
- Real workload simulation, failure injection, cache/shard behavior, and cost/latency trade-offs.
- Connection-port gestures, automatic graph layout, reference solutions, and learning milestones.
- Optional accounts, cloud persistence, and sharing.
