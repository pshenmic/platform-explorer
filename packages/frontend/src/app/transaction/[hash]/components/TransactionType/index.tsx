import {
  MasterNodeVote,
  DataContractCreate,
  Batch,
  IdentityCreate,
  IdentityTopUp,
  DataContractUpdate,
  IdentityUpdate,
  IdentityCreditWithdrawal,
  IdentityCreditTransfer,
  AddressFundsTransfer,
  AddressFundingFromAssetLock,
  AddressCreditWithdrawal,
  IdentityCreditTransferToAddress,
  IdentityCreateFromAddresses,
  IdentityTopUpFromAddresses,
  Shield,
  ShieldedTransfer,
  Unshield,
  ShieldFromAssetLock,
  ShieldedWithdrawal,
  IdentityCreateFromShieldedPool,
  IdentityKeyLimitsUpdate,
  ContractUserModeration,
  ContractFeeClaim,
  ShieldFromIdentity,
  IdentityTopUpFromShieldedPool,
  TokenShieldedTransferWithShieldedFee,
  TokenUnshieldWithShieldedFee,
  TokenPurchaseFromShieldedPool
} from './variants'
import type { DecodedStateTransition, WithRate } from '../types'
import { JsonDetails } from '@components/transactions/TransactionDetails'

export type TransactionTypeProps = DecodedStateTransition & WithRate

export const TransactionType = ({ typeString: type, ...other }: TransactionTypeProps) => {
  // Variants are still largely JS with JSDoc props; cast until all are migrated.
  const props = other as Record<string, unknown>

  if (type === 'MASTERNODE_VOTE') {
    return <MasterNodeVote {...props} />
  }

  if (type === 'DATA_CONTRACT_CREATE') {
    return <DataContractCreate {...props} />
  }

  if (type === 'BATCH') {
    return <Batch {...props} />
  }

  if (type === 'IDENTITY_CREATE') {
    return <IdentityCreate {...props} />
  }

  if (type === 'IDENTITY_TOP_UP') {
    return <IdentityTopUp {...props} />
  }

  if (type === 'DATA_CONTRACT_UPDATE') {
    return <DataContractUpdate {...props} />
  }

  if (type === 'IDENTITY_UPDATE') {
    return <IdentityUpdate {...props} />
  }

  if (type === 'IDENTITY_CREDIT_WITHDRAWAL') {
    return <IdentityCreditWithdrawal {...props} />
  }

  if (type === 'IDENTITY_CREDIT_TRANSFER') {
    return <IdentityCreditTransfer {...props} />
  }

  if (type === 'IDENTITY_CREDIT_TRANSFER_TO_ADDRESS') {
    return <IdentityCreditTransferToAddress {...props} />
  }

  if (type === 'IDENTITY_CREATE_FROM_ADDRESSES') {
    return <IdentityCreateFromAddresses {...props} />
  }

  if (type === 'IDENTITY_TOP_UP_FROM_ADDRESSES') {
    return <IdentityTopUpFromAddresses {...props} />
  }

  if (type === 'ADDRESS_FUNDS_TRANSFER') {
    return <AddressFundsTransfer {...props} />
  }

  if (type === 'ADDRESS_FUNDING_FROM_ASSET_LOCK') {
    return <AddressFundingFromAssetLock {...props} />
  }

  if (type === 'ADDRESS_CREDIT_WITHDRAWAL') {
    return <AddressCreditWithdrawal {...props} />
  }

  if (type === 'SHIELD') {
    return <Shield {...props} />
  }

  if (type === 'SHIELDED_TRANSFER') {
    return <ShieldedTransfer {...props} />
  }

  if (type === 'UNSHIELD') {
    return <Unshield {...props} />
  }

  if (type === 'SHIELD_FROM_ASSET_LOCK') {
    return <ShieldFromAssetLock {...props} />
  }

  if (type === 'SHIELDED_WITHDRAWAL') {
    return <ShieldedWithdrawal {...props} />
  }

  if (type === 'IDENTITY_CREATE_FROM_SHIELDED_POOL') {
    return <IdentityCreateFromShieldedPool {...props} />
  }

  if (type === 'IDENTITY_KEY_LIMITS_UPDATE') {
    return <IdentityKeyLimitsUpdate {...other} />
  }

  if (type === 'CONTRACT_USER_MODERATION') {
    return <ContractUserModeration {...other} />
  }

  if (type === 'CONTRACT_FEE_CLAIM') {
    return <ContractFeeClaim {...other} />
  }

  if (type === 'SHIELD_FROM_IDENTITY') {
    return <ShieldFromIdentity {...other} />
  }

  if (type === 'IDENTITY_TOP_UP_FROM_SHIELDED_POOL') {
    return <IdentityTopUpFromShieldedPool {...other} />
  }

  if (type === 'TOKEN_SHIELDED_TRANSFER_WITH_SHIELDED_FEE') {
    return <TokenShieldedTransferWithShieldedFee {...other} />
  }

  if (type === 'TOKEN_UNSHIELD_WITH_SHIELDED_FEE') {
    return <TokenUnshieldWithShieldedFee {...other} />
  }

  if (type === 'TOKEN_PURCHASE_FROM_SHIELDED_POOL') {
    return <TokenPurchaseFromShieldedPool {...other} />
  }

  const { rate, ...decoded } = other
  return <JsonDetails title="Decoded transaction" value={{ typeString: type, ...decoded }} />
}
