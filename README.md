# System Design Quest

An interactive, beginner-friendly system design learning platform. Learn the foundations, practice with short quizzes, and build architectures through guided design quests.

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

## Phase 1 features

- **Learn:** five structured beginner lessons: client–server, HTTP/APIs, DNS, SQL vs NoSQL, and latency vs throughput. Each includes an example and takeaway.
- **Quiz:** ten topic-mapped concept/scenario MCQs. Practice one topic or all topics, check answers with explanations, advance, and review your final score.
- **Design Game:** add Client, Load Balancer, App Server, Cache, SQL DB, and Queue blocks. Edit names, types, and replicas (1–100); delete blocks; create/remove directed connections.
- **Three easy quests:** serve a static site, prepare for 10,000 users with load balancing/replicas, and design a URL shortener with SQL storage and a cache.
- **Actionable validation:** pass/fail and a requirements-met breakdown. Connections must point in the required direction, connect components meeting the task's replica requirements, and be reachable from the task's entry component through required connection types.
- **Local persistence:** boards save independently per task and survive reloads. Reset Task clears only the selected board after confirmation. Missing/corrupt saved boards fall back to empty; storage write failures display a warning and do not stop play.
- Responsive layout, keyboard-operable controls, labeled inputs, and helpful empty states.

### Try a first quest

1. Open **Design Game** and choose **Serve your first website**.
2. Add a **Client** and an **App Server**.
3. Under Connections, choose Client as **From** and App Server as **To**, then **Connect**.
4. Select **Run Validation**. The three requirements should pass.
5. Try the next task: put a Load Balancer between the client and server, and edit the connected App Server to use at least two replicas.

**Scope:** Phase 1 evaluates structural requirements, not real traffic, latency, cost, availability, or production readiness. “10,000 users” is a learning scenario, not a measured capacity guarantee. App Server also represents a simple static file server in the first quest. Examples are simplified educational designs, not claims about any company's internal architecture.

Boards stay in this browser/origin under `system-design-quest:board:v1:<task-id>` localStorage keys. They are not synced or backed up, so avoid storing sensitive information. Quiz progress resets when leaving Quiz or reloading.

## Project structure

```text
src/
  App.tsx              Navigation and app shell
  components/          Learn, Quiz, and DesignGame sections
    shared/            Reusable buttons, badges, headers, fields, and options
  constants.ts         UI copy, icons, navigation, and copy formatters
  data/                Topics, quiz questions, and task definitions
  lib/storage.ts       Defensive board parsing and localStorage access
  lib/validation.ts    Pure data-driven task evaluation
  types.ts             Shared content, board, task, and result interfaces
  index.css            Tailwind integration and responsive styles
tests/                 Content, validation, persistence, copy, and JSX convention tests
```

The app uses React, TypeScript, Vite, and Tailwind CSS, with a simple single-page navigation structure. Add lessons/questions in `src/data/`; add tasks using the existing component/connection rule types. New rule kinds belong in `TaskRule` and the validator. `npm test` exercises the pure modules directly using Node's TypeScript stripping.

## Next phases

- Medium/hard tasks: uploads, messaging, video delivery, and multi-region systems.
- Measured traffic simulation, failure injection, and explicit cost/latency trade-offs.
- Visual graph editing, hints, reference solutions, and learning milestones.
- Optional accounts, cloud persistence, and sharing.
