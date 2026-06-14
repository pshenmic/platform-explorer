import type { ContestedResource } from './ContestedResource'

// Mirrors packages/api/src/models/ContestedResourcesStatus.js

export interface ContestedResourcesStatus {
  totalContestedResources: number
  totalPendingContestedResources: number
  totalVotesCount: number
  expiringContestedResource: ContestedResource | null
}
