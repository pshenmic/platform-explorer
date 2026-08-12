// User-friendly text for consensus error names. Authoritative source: packages/api/src/enums/ConsensusErrorEnum.js.

export const CONSENSUS_ERROR_MESSAGES: Record<string, string> = {
  IdentityInsufficientBalanceError: 'Insufficient credits. Top up identity.',
  AddressInvalidNonceError: 'Nonce mismatch — already broadcast or out of order.',
  InvalidIdentityNonceError: 'Invalid identity nonce.',
  NonceOutOfBoundsError: 'Nonce out of allowed range. Regenerate.',
  IdentityNotFoundError: 'Identity not found.',
  InvalidStateTransitionSignatureError: 'Invalid signature. Re-sign with correct key.',
  MissingPublicKeyError: 'Public key not found on identity.',
  InvalidSignaturePublicKeySecurityLevelError:
    'Signing key security level too low. Sign first to fix.',
  PublicKeySecurityLevelNotMetError: 'Signing key security level too low.',
  InvalidSignaturePublicKeyPurposeError: 'Signing key has wrong purpose.',
  WrongPublicKeyPurposeError: 'Signing key has wrong purpose.',
  PublicKeyIsDisabledError: 'Public key is disabled.',
  DataContractAlreadyPresentError: 'Contract ID already exists. Regenerate with new nonce.',
  JsonSchemaError: 'Violates contract schema.',
  InvalidDocumentRevisionError: 'Invalid document revision.',
  DocumentAlreadyPresentError: 'Document already exists.',
  DocumentNotFoundError: 'Document not found.',
  DataContractNotPresentError: 'Contract not found.',
  DataContractIsReadonlyError: 'Contract is read-only.',
  BalanceIsNotEnoughError: 'Insufficient credits for fees.',
  StateTransitionMaxSizeExceededError: 'Transaction too large.',
  InvalidStateTransitionTypeError: 'Unknown state transition type.',
  DuplicateUniqueIndexError: 'Duplicate value in unique index.'
}

export function explainConsensusError(
  errorName: string | null | undefined,
  code: number | null | undefined
): string {
  if (!errorName) {
    return code != null
      ? `Drive rejected the transaction (code ${code})`
      : 'Drive rejected the transaction'
  }
  return (
    CONSENSUS_ERROR_MESSAGES[errorName] ?? `${errorName}${code != null ? ` (code ${code})` : ''}`
  )
}
