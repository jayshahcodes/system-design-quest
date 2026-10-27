export const resourceCopy = {
  eyebrow: 'READ BEYOND THE LESSON',
  title: 'Engineering resource library',
  intro: 'Explore intermediate and advanced ideas from Netflix, the Jio ecosystem, Amazon / AWS, and Google.',
  sourcing: 'Curated original summaries, not exhaustive or current company blueprints. Original articles are linked, not reproduced. Retrieval statuses describe editorial checks, not real-time link monitoring.',
  jumpNavigation: 'Jump to a learning section',
  jumpResources: 'Explore engineering resources',
  jumpLessons: 'Go to learning topics',
  query: 'Search resources',
  queryPlaceholder: 'Search titles, concepts, or takeaways',
  publisher: 'Publisher group',
  concept: 'Concept',
  allPublishers: 'All publishers',
  allConcepts: 'All concepts',
  reset: 'Reset resource filters',
  emptyTitle: 'No matching resources',
  emptyHelp: 'Try a broader search, another publisher or concept, or reset the filters.',
  readingGuide: 'Reading guide and related lessons',
  takeaways: 'Ideas to look for',
  discussion: 'Discuss the trade-offs',
  relatedLessons: 'Continue with a lesson',
  referenceOnly: 'Reference only · not retrieved',
  retrieved: 'Retrieved for curation',
  exerciseTitle: 'Try a design exercise',
  exerciseCheckpoints: 'Check your reasoning',
}

export function resourceCount(count: number, total: number): string {
  return `${count} of ${total} ${total === 1 ? 'resource' : 'resources'}`
}

export function resourceLinkLabel(title: string): string {
  return `${title} (opens in a new tab)`
}
