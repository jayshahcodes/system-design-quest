import { topics } from '../../data/topics'
import { componentTypes } from '../../types'
import type { GameComponent, Topic, ComponentType } from '../../types'

function renderTopic(topic: Topic) {
  return (
    <option key={topic.id} value={topic.id}>{topic.title}</option>
  )
}

export function TopicOptions() {
  return <>{topics.map(renderTopic)}</>
}

function renderType(type: ComponentType) {
  return (
    <option key={type}>{type}</option>
  )
}

export function ComponentTypeOptions() {
  return <>{componentTypes.map(renderType)}</>
}

function renderComponent(component: GameComponent) {
  return (
    <option key={component.id} value={component.id}>{component.name}</option>
  )
}

export function ComponentOptions({ components }: { components: GameComponent[] }) {
  return <>{components.map(renderComponent)}</>
}
