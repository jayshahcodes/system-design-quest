import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { resources } from '../data/resources'
import { topics } from '../data/topics'
import { filterResources, resourceConcepts, resourcePublishers } from '../lib/resources'
import { resourceCopy, resourceCount, resourceLinkLabel } from '../resourceConstants'
import type { LearningResource, Topic } from '../types'
import { Badge } from './shared/Badge'
import { Button } from './shared/Button'
import { InputField, SelectField } from './shared/Fields'
import '../resource.css'

interface ResourceLibraryProps {
  onTopic: (id: string) => void
}

interface ResourceCardProps extends ResourceLibraryProps {
  resource: LearningResource
}

interface RelatedLessonProps extends ResourceLibraryProps {
  topic: Topic
}

function RelatedLesson({ topic, onTopic }: RelatedLessonProps) {
  function selectLesson() {
    onTopic(topic.id)
  }

  return <Button variant="secondary" onClick={selectLesson}>{topic.title}</Button>
}

function renderTakeaway(takeaway: string) {
  return <li key={takeaway}>{takeaway}</li>
}

function renderConcept(concept: string) {
  return <Badge key={concept}>{concept}</Badge>
}

function renderOption(value: string) {
  return <option key={value} value={value}>{value}</option>
}

function ResourceCard({ resource, onTopic }: ResourceCardProps) {
  function isRelatedTopic(topic: Topic) {
    return resource.topicIds.includes(topic.id)
  }

  function renderRelatedLesson(topic: Topic) {
    return <RelatedLesson key={topic.id} topic={topic} onTopic={onTopic} />
  }

  const relatedTopics = topics.filter(isRelatedTopic)
  const verificationLabel = resource.verification === 'reference-only'
    ? resourceCopy.referenceOnly : resourceCopy.retrieved

  return (
    <article className="resource-card">
      <div className="resource-meta">
        <Badge>{resource.publisher}</Badge>
        <span>{resource.kind}</span>
        <span>{resource.level}</span>
      </div>
      <h3>
        <a href={resource.url} target="_blank" rel="noreferrer" aria-label={resourceLinkLabel(resource.title)}>
          {resource.title}
        </a>
      </h3>
      <p className="resource-attribution">{resource.attribution}</p>
      <p>{resource.summary}</p>
      <div className="resource-concepts">{resource.concepts.map(renderConcept)}</div>
      <div className="resource-verification">
        <strong>{verificationLabel}</strong>
        <p>{resource.verificationNote}</p>
      </div>
      <details className="resource-guide">
        <summary>{resourceCopy.readingGuide}</summary>
        <h4>{resourceCopy.takeaways}</h4>
        <ul>{resource.takeaways.map(renderTakeaway)}</ul>
        <h4>{resourceCopy.discussion}</h4>
        <p>{resource.discussion}</p>
        {relatedTopics.length > 0 && (
          <div className="resource-related">
            <h4>{resourceCopy.relatedLessons}</h4>
            <div className="resource-lesson-links">{relatedTopics.map(renderRelatedLesson)}</div>
          </div>
        )}
      </details>
    </article>
  )
}

export function ResourceLibrary({ onTopic }: ResourceLibraryProps) {
  const [query, setQuery] = useState('')
  const [publisher, setPublisher] = useState('all')
  const [concept, setConcept] = useState('all')
  const visibleResources = filterResources(resources, { query, publisher, concept })
  const publishers = resourcePublishers(resources)
  const concepts = resourceConcepts(resources)

  function changeQuery(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }

  function changePublisher(event: ChangeEvent<HTMLSelectElement>) {
    setPublisher(event.target.value)
  }

  function changeConcept(event: ChangeEvent<HTMLSelectElement>) {
    setConcept(event.target.value)
  }

  function resetFilters() {
    setQuery('')
    setPublisher('all')
    setConcept('all')
  }

  function renderResource(resource: LearningResource) {
    return <ResourceCard key={resource.id} resource={resource} onTopic={onTopic} />
  }

  return (
    <section id="engineering-resources" className="resource-library" aria-labelledby="resource-heading">
      <div className="resource-heading">
        <div className="eyebrow">{resourceCopy.eyebrow}</div>
        <h2 id="resource-heading">{resourceCopy.title}</h2>
        <p>{resourceCopy.intro}</p>
      </div>
      <p className="resource-sourcing">{resourceCopy.sourcing}</p>
      <div className="resource-filters">
        <div>
          <InputField
            id="resource-query" type="search" label={resourceCopy.query}
            placeholder={resourceCopy.queryPlaceholder} value={query} onChange={changeQuery}
          />
        </div>
        <div>
          <SelectField id="resource-publisher" label={resourceCopy.publisher} value={publisher} onChange={changePublisher}>
            <option value="all">{resourceCopy.allPublishers}</option>
            {publishers.map(renderOption)}
          </SelectField>
        </div>
        <div>
          <SelectField id="resource-concept" label={resourceCopy.concept} value={concept} onChange={changeConcept}>
            <option value="all">{resourceCopy.allConcepts}</option>
            {concepts.map(renderOption)}
          </SelectField>
        </div>
      </div>
      <div className="resource-results">
        <p role="status" aria-live="polite" aria-atomic="true">{resourceCount(visibleResources.length, resources.length)}</p>
        <Button variant="text" onClick={resetFilters}>{resourceCopy.reset}</Button>
      </div>
      {visibleResources.length === 0 && (
        <div className="resource-empty panel">
          <h3>{resourceCopy.emptyTitle}</h3>
          <p>{resourceCopy.emptyHelp}</p>
        </div>
      )}
      <div className="resource-grid">{visibleResources.map(renderResource)}</div>
    </section>
  )
}
