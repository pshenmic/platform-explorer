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
  IdentityCreateFromShieldedPool
} from './variants'
import type { DecodedStateTransition, WithRate } from '../types'

export type TransactionTypeProps = DecodedStateTransition & WithRate

export const TransactionType = ({ typeString: type, ...other }: TransactionTypeProps) => {
  if (other.data === null) return <></>

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

  return <></>
}
