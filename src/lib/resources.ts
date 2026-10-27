import type { LearningResource } from '../types.ts'

export interface ResourceFilters {
  query: string
  publisher: string
  concept: string
}

export function filterResources(resources: LearningResource[], filters: ResourceFilters): LearningResource[] {
  const query = filters.query.trim().toLocaleLowerCase()

  function matchesResource(resource: LearningResource): boolean {
    const text = [
      resource.title, resource.summary, resource.attribution,
      ...resource.concepts, ...resource.takeaways,
    ].join(' ').toLocaleLowerCase()

    return (filters.publisher === 'all' || resource.publisher === filters.publisher)
      && (filters.concept === 'all' || resource.concepts.includes(filters.concept))
      && (!query || text.includes(query))
  }

  return resources.filter(matchesResource)
}

export function resourcePublishers(resources: LearningResource[]): string[] {
  function publisher(resource: LearningResource): string {
    return resource.publisher
  }

  return [...new Set(resources.map(publisher))].sort()
}

export function resourceConcepts(resources: LearningResource[]): string[] {
  function concepts(resource: LearningResource): string[] {
    return resource.concepts
  }

  return [...new Set(resources.flatMap(concepts))].sort()
}
