import { topics } from '../../data/topics'
import { componentTypes } from '../../types'
import type { GameComponent, Topic, ComponentType } from '../../types'
import { learningLevels } from '../../constants'

function renderTopic(topic: Topic) {
  return (
    <option key={topic.id} value={topic.id}>{topic.title}</option>
  )
}

export function TopicOptions() {
  function renderGroup(level: (typeof learningLevels)[number]) {
    function hasLevel(topic: Topic) {
      return (topic.level ?? learningLevels[0]) === level
    }

    return <optgroup key={level} label={level}>{topics.filter(hasLevel).map(renderTopic)}</optgroup>
  }

  return <>{learningLevels.map(renderGroup)}</>
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
