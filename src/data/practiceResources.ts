import type { LearningResource } from '../types.ts'

const verificationNote = 'User-suggested reference only: the page could not be retrieved because DNS lookup failed during curation on 2026-10-27. Its topics, contents, and availability are unverified. These reading goals and linked lessons are original exercises, not summaries or reproductions of the site. No access restrictions were bypassed.'

export const practiceResources: LearningResource[] = [
  {
    id: 'systemdesign-directory', title: 'SystemDesign.io — user-suggested learning reference',
    url: 'https://systemdesign.io', publisher: 'SystemDesign.io', kind: 'Learning directory',
    attribution: 'Independent user-suggested learning site; no affiliation or verified coverage claimed.',
    level: 'Intermediate', concepts: ['Rate limiting', 'Pagination', 'Transactions'],
    summary: 'An external reference to explore separately. The accompanying original lessons fill gaps in this app; the site’s own syllabus was not accessible.',
    takeaways: [
      'Original reading goal: compare per-caller admission budgets with system-wide overload protection.',
      'Original reading goal: reason about ordered pagination when records change between requests.',
      'Original reading goal: identify which writes a database transaction can commit together.',
    ],
    discussion: 'For an API you use, separate its user requirements, data access patterns, and failure assumptions before choosing infrastructure.',
    topicIds: ['rate-limiting', 'pagination-indexes', 'transaction-boundaries'],
    verification: 'reference-only', verificationNote,
  },
  {
    id: 'fanout-overview', title: 'Fanout — system overview reference',
    url: 'https://fanout.sh/system/overview', publisher: 'Fanout', kind: 'Learning directory',
    attribution: 'User-provided Fanout overview URL; its page content and editorial claims were not reviewed.',
    level: 'Intermediate', concepts: ['Rate limiting', 'Transactions', 'Realtime delivery'],
    summary: 'A suggested starting URL, not a verified topic inventory. Use our original prompts to connect API behavior with storage and delivery choices.',
    takeaways: [
      'Original reading goal: state measurable requirements before drawing a component diagram.',
      'Original reading goal: separate durable acceptance from a successful notification.',
      'Original reading goal: list failure cases that topology alone cannot validate.',
    ],
    discussion: 'Which product promises require durable state, and which signals can be best-effort?',
    topicIds: ['rate-limiting', 'transaction-boundaries', 'realtime-delivery'],
    verification: 'reference-only', verificationNote,
  },
  {
    id: 'fanout-systems', title: 'Fanout — systems reference',
    url: 'https://fanout.sh/system/systems', publisher: 'Fanout', kind: 'Learning directory',
    attribution: 'User-provided Fanout systems URL; no individual system or architecture is inferred from this URL.',
    level: 'Advanced', concepts: ['Projections', 'Realtime delivery', 'Geo routing'],
    summary: 'An unreviewed external directory reference paired with original systems exercises, without importing diagrams or proposed solutions.',
    takeaways: [
      'Original reading goal: distinguish an authoritative event history from a derived read model.',
      'Original reading goal: design reconnect and resume behavior without promising exactly-once delivery.',
      'Original reading goal: separate regional request routing from database write ownership.',
    ],
    discussion: 'Trace a write from durable acceptance to a rebuilt projection and a reconnecting client. Where can work repeat?',
    topicIds: ['event-log-projections', 'realtime-delivery', 'geo-routing'],
    verification: 'reference-only', verificationNote,
  },
  {
    id: 'fanout-case-studies', title: 'Fanout — case studies reference',
    url: 'https://fanout.sh/system/case-studies', publisher: 'Fanout', kind: 'Learning directory',
    attribution: 'User-provided Fanout case-studies URL; no company-specific implementation details were verified.',
    level: 'Advanced', concepts: ['Transactions', 'Projections', 'Geo routing'],
    summary: 'A reference for independent browsing. Our exercises are hypothetical designs, not claims about this directory’s case studies or current company infrastructure.',
    takeaways: [
      'Original reading goal: distinguish published facts, estimates, and proposed alternatives.',
      'Original reading goal: identify the consistency boundary for each product invariant.',
      'Original reading goal: evaluate failover and replay as well as a design’s normal path.',
    ],
    discussion: 'What evidence would you need before applying a published design’s trade-offs to a smaller product?',
    topicIds: ['transaction-boundaries', 'event-log-projections', 'geo-routing'],
    verification: 'reference-only', verificationNote,
  },
]
