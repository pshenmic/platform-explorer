export interface ShieldedPayload {
  actions?: unknown[] | null
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
}

export interface ShieldedTokenPayload extends ShieldedPayload {
  tokenId?: string | null
  tokenContractPosition?: number | string | null
  dataContractId?: string | null
  identityContractNonce?: number | string | null
  amount?: number | string | null
  burnAmount?: number | string | null
  totalAgreedPrice?: number | string | null
  creditAmount?: number | string | null
  recipient?: string | null
  recipientId?: string | null
  publicNote?: string | null
  distributionType?: string | number | null
  claimUpTo?: string | number | null
  tokenActions?: unknown[] | null
  tokenAnchor?: string | null
  tokenProof?: string | null
  tokenBindingSignature?: string | null
  feeActions?: unknown[] | null
  feeAnchor?: string | null
  feeProof?: string | null
  feeBindingSignature?: string | null
}
