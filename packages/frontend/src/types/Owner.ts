import type { Alias } from './Alias'

// Not a backend model — `owner` is an enriched response field returned by
// many endpoints (transaction.owner, document.owner, token.owner, etc.).

export interface Owner {
  identifier: string
  aliases: Alias[]
}
