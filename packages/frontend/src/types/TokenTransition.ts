// Mirrors packages/api/src/models/TokenTransition.js
// Note: backend file exports class named `Token` but represents a token
// transition row. Field set mirrors the constructor.

export interface TokenTransition {
  amount: string | null
  recipient: string | null
  owner: string | null
  action: string | null
  stateTransitionHash: string | null
  timestamp: string | null
  publicNote: string | null
}
