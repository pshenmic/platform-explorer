import type { BlockHeader } from './BlockHeader'

// Mirrors packages/api/src/models/Block.js

export interface Block {
  header: BlockHeader
  txs: string[]
}
