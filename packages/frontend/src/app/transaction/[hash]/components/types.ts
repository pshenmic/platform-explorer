import type { LoadableState } from '../../../../types/common'
import type { Rate } from '../../../../types'
import type { PublicKeyData } from '../../../../components/transactions/PublicKeyCard'
import type { TransitionData } from '../../../../components/transactions/TransitionCard'

/** Nested platform address as returned by decodeTx for address-based transitions. */
export interface DecodedPlatformAddress {
  bech32m?: string | null
  base58?: string | null
}

export interface DecodedTxInput {
  platformAddress: DecodedPlatformAddress
  credits?: number | string | null
  nonce?: number | string | null
}

export interface DecodedTxOutput {
  platformAddress: DecodedPlatformAddress
  credits?: number | string | null
}

export interface DecodedInputWitness {
  type?: string | number | null
  value?: {
    signature?: string | null
    [key: string]: unknown
  } | null
}

export interface DecodedFeeStrategy {
  type?: string | null
  value?: string | number | null
}

export interface AssetLockProofData {
  fundingCoreTx?: string | null
  instantLock?: string | null
  type?: string | number | null
  fundingAmount?: number | string | null
  vout?: number | null
  coreChainLockedHeight?: number | null
}

export interface ShieldedAction {
  nullifier?: string | null
  rk?: string | null
  cmx?: string | null
  encryptedNote?: string | null
  cvNet?: string | null
  spendAuthSig?: string | null
  [key: string]: unknown
}

/** Output address may be a Core string or a nested Platform address object. */
export type DecodedOutputAddress =
  | string
  | {
      platformAddress?: DecodedPlatformAddress | null
      [key: string]: unknown
    }
  | null
  | undefined

export interface TokenConventions {
  decimals?: number | null
  localizations?: Record<string, { singularForm?: string; pluralForm?: string; shouldCapitalize?: boolean }> | null
}

export interface TokenDistributionRules {
  tokenId?: string | null
  perpetualDistribution?: {
    functionName?: string | null
    functionValue?: Record<string, unknown> | null
    [key: string]: unknown
  } | null
  [key: string]: unknown
}

/** Flattened token configuration blob nested under DATA_CONTRACT_CREATE. */
export interface TokenConfigurationData {
  position?: number | null
  conventions?: TokenConventions | null
  keepsHistory?: unknown
  baseSupply?: number | string | null
  maxSupply?: number | string | null
  startAsPaused?: boolean | null
  isAllowedTransferToFrozenBalance?: boolean | null
  maxSupplyChangeRules?: unknown
  distributionRules?: TokenDistributionRules | null
  perpetualDistribution?: unknown
  marketplaceRules?: unknown
  manualMintingRules?: unknown
  manualBurningRules?: unknown
  freezeRules?: unknown
  unfreezeRules?: unknown
  destroyFrozenFundsRules?: unknown
  emergencyActionRules?: unknown
  mainControlGroup?: unknown
  mainControlGroupCanBeModified?: unknown
  description?: string | null
}

/**
 * Decoded state transition payload from `Api.decodeTx`.
 * Shape varies widely by `typeString`; fields are optional and loosely typed.
 */
export interface DecodedStateTransition {
  type?: number | string | null
  typeString?: string | null
  userFeeIncrease?: number | null
  signature?: string | null
  data?: unknown
  outputAddress?: DecodedOutputAddress
  fundingAddress?: string | null
  coreFeePerByte?: number | null
  ownerId?: string | null
  identityId?: string | null
  senderId?: string | null
  recipientId?: string | null
  amount?: number | string | null
  valueBalance?: number | string | null
  unshieldingAmount?: number | string | null
  identityNonce?: number | string | null
  identityContractNonce?: number | string | null
  signaturePublicKeyId?: number | string | null
  revision?: number | string | null
  version?: number | string | null
  dataContractId?: string | null
  schema?: unknown
  internalConfig?: Record<string, unknown> | null
  tokens?: TokenConfigurationData[] | null
  transitions?: TransitionData[] | null
  publicKeys?: PublicKeyData[] | null
  publicKeysToAdd?: PublicKeyData[] | null
  publicKeyIdsToDisable?: Array<number | string> | null
  assetLockProof?: AssetLockProofData | null
  inputs?: DecodedTxInput[] | null
  inputWitness?: DecodedInputWitness[] | null
  inputWitnesses?: DecodedInputWitness[] | null
  outputs?: DecodedTxOutput[] | null
  output?: unknown
  feeStrategy?: DecodedFeeStrategy[] | null
  actions?: ShieldedAction[] | null
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
  outputScript?: string | null
  pooling?: string | number | null
  raw?: string | null
  proTxHash?: string | null
  contractId?: string | null
  choice?: string | null
  documentTypeName?: string | null
  indexName?: string | null
  indexValues?: string[] | null
  recipientAddresses?: Array<{
    platformAddress?: DecodedPlatformAddress | null
    amount?: number | string | null
  }> | null
  nonce?: number | string | null
  surplusOutput?: unknown
  [key: string]: unknown
}

export type RateState = LoadableState<Rate>

export interface WithLoading {
  loading?: boolean
}

export interface WithRate {
  rate?: RateState | { data?: Pick<Rate, 'usd'> | null } | null
}
