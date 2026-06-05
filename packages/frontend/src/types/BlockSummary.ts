// Used by Status.api.block / Status.tenderdash.block.
// Not a backend model — local helper type.

export interface BlockSummary {
  height: number
  hash: string
  timestamp: string
}
