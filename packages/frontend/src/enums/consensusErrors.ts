// Maps ConsensusError names from /transaction/verify to user-friendly messages.
// Backend enum lives at packages/api/src/enums/ConsensusErrorEnum.js (332 codes).
// Only common cases are mapped here — fallback shows the raw name + code.

export const CONSENSUS_ERROR_MESSAGES: Record<string, string> = {
  IdentityInsufficientBalanceError: 'Identity has insufficient credits. Top up before broadcasting.',
  AddressInvalidNonceError: 'Nonce mismatch — transaction may have been broadcast already or is out of order.',
  InvalidIdentityNonceError: 'Invalid identity nonce. Transaction may already be included or skipped.',
  IdentityNotFoundError: 'Identity not found on the platform.',
  InvalidStateTransitionSignatureError: 'Invalid signature. Re-sign the transaction with the correct key.',
  JsonSchemaError: 'Transaction violates the data contract schema.',
  InvalidDocumentRevisionError: 'Invalid document revision. Refetch and resubmit.',
  DocumentAlreadyPresentError: 'Document already exists with this identifier.',
  DocumentNotFoundError: 'Referenced document does not exist.',
  DataContractNotPresentError: 'Referenced data contract not found.',
  DataContractIsReadonlyError: 'Data contract is read-only and cannot be modified.',
  BalanceIsNotEnoughError: 'Insufficient credits to pay processing fees.',
  StateTransitionMaxSizeExceededError: 'Transaction exceeds maximum allowed size.',
  DuplicateUniqueIndexError: 'Value violates a unique index on the document.'
}

export function explainConsensusError (errorName: string | null | undefined, code: number | null | undefined): string {
  if (!errorName) {
    return code != null ? `Drive rejected the transaction (code ${code})` : 'Drive rejected the transaction'
  }
  return CONSENSUS_ERROR_MESSAGES[errorName] ?? `${errorName}${code != null ? ` (code ${code})` : ''}`
}
