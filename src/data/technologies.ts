import { componentTypes } from '../types.ts'
import type { ComponentType, GameComponent } from '../types.ts'

export interface Technology {
  id: string
  name: string
  types: ComponentType[]
  description: string
}

export const technologies: Technology[] = [
  { id: 'generic', name: 'Generic', types: [...componentTypes], description: 'Practice the component role without choosing a product; no infrastructure is provisioned.' },
  { id: 'postgresql', name: 'PostgreSQL', types: ['SQL DB'], description: 'Relational transactions and rich queries; schema and index design require care.' },
  { id: 'mysql', name: 'MySQL', types: ['SQL DB'], description: 'Relational storage with a broad ecosystem; replication and query tuning need planning.' },
  { id: 'mongodb', name: 'MongoDB', types: ['NoSQL DB'], description: 'Document-oriented models suit flexible records; query patterns guide indexes and shard keys.' },
  { id: 'dynamodb', name: 'DynamoDB', types: ['NoSQL DB'], description: 'Managed key-value and document storage; access patterns and partition keys constrain design.' },
  { id: 'redis', name: 'Redis', types: ['Cache'], description: 'In-memory data structures support versatile caching; memory cost and eviction policy matter.' },
  { id: 'memcached', name: 'Memcached', types: ['Cache'], description: 'Simple distributed key-value caching; applications coordinate misses and invalidation.' },
  { id: 'nginx', name: 'Nginx', types: ['Load Balancer'], description: 'Reverse proxy and load balancing with configurable routing; configuration and operations remain your responsibility.' },
  { id: 'haproxy', name: 'HAProxy', types: ['Load Balancer'], description: 'Dedicated proxy and load balancer; health checks and connection limits need tuning.' },
  { id: 'nodejs', name: 'Node.js', types: ['App Server'], description: 'Event-driven JavaScript runtime for I/O-heavy services; CPU-heavy work may need separate workers.' },
  { id: 'spring-boot', name: 'Spring Boot', types: ['App Server'], description: 'Java application framework with integrated conventions; startup and resource costs need measurement.' },
  { id: 'go', name: 'Go', types: ['App Server', 'Worker'], description: 'Compiled services with lightweight concurrency; application design still determines correctness and performance.' },
  { id: 'rabbitmq', name: 'RabbitMQ', types: ['Queue'], description: 'Message broker with flexible routing and acknowledgements; consumers must handle retries and duplicates.' },
  { id: 'kafka', name: 'Kafka', types: ['Queue'], description: 'Partitioned event log supports replay; partitioning, ordering, and consumer lag need planning.' },
  { id: 's3', name: 'Amazon S3', types: ['Object Storage'], description: 'Managed object storage for files; object access, transfer cost, and lifecycle policies require design.' },
  { id: 'gcs', name: 'Google Cloud Storage', types: ['Object Storage'], description: 'Managed object storage with lifecycle controls; permissions and data transfer remain design choices.' },
  { id: 'cloudfront', name: 'CloudFront', types: ['CDN'], description: 'Edge content delivery with origin integration; cache keys, TTLs, and invalidation affect freshness.' },
  { id: 'cloudflare', name: 'Cloudflare', types: ['CDN'], description: 'Edge caching and delivery; origin behavior and caching rules determine what can be cached.' },
  { id: 'celery', name: 'Celery', types: ['Worker'], description: 'Python background task workers using a broker; idempotency and retry policy remain application concerns.' },
  { id: 'bullmq', name: 'BullMQ', types: ['Worker'], description: 'Node.js job processing backed by Redis; job durability and retry behavior need deliberate configuration.' },
]

export function getTechnologies(type: ComponentType): Technology[] {
  return technologies.filter((technology) => technology.types.includes(type))
}

export function getTechnology(component: GameComponent): Technology {
  return technologies.find((technology) => technology.id === component.settings?.technology && technology.types.includes(component.type))
    ?? technologies[0]
}
