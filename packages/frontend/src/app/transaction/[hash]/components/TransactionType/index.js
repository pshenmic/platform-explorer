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
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'

export const TransactionType = ({ typeString: type, ...other }) => {
  if (other.data === null) return <></>

  if (type === 'MASTERNODE_VOTE') {
    return <MasterNodeVote {...other} />
  }

  if (type === 'DATA_CONTRACT_CREATE') {
    return <DataContractCreate {...other} />
  }

  if (type === 'BATCH') {
    return <Batch {...other} />
  }

  if (type === 'IDENTITY_CREATE') {
    return <IdentityCreate {...other} />
  }

  if (type === 'IDENTITY_TOP_UP') {
    return <IdentityTopUp {...other} />
  }

  if (type === 'DATA_CONTRACT_UPDATE') {
    return <DataContractUpdate {...other} />
  }

  if (type === 'IDENTITY_UPDATE') {
    return <IdentityUpdate {...other} />
  }

  if (type === 'IDENTITY_CREDIT_WITHDRAWAL') {
    return <IdentityCreditWithdrawal {...other} />
  }

  if (type === 'IDENTITY_CREDIT_TRANSFER') {
    return <IdentityCreditTransfer {...other} />
  }

  if (type === 'IDENTITY_CREDIT_TRANSFER_TO_ADDRESS') {
    return <IdentityCreditTransferToAddress {...other} />
  }

  if (type === 'IDENTITY_CREATE_FROM_ADDRESSES') {
    return <IdentityCreateFromAddresses {...other} />
  }

  if (type === 'IDENTITY_TOP_UP_FROM_ADDRESSES') {
    return <IdentityTopUpFromAddresses {...other} /> // +
  }

  if (type === 'ADDRESS_FUNDS_TRANSFER') {
    return <AddressFundsTransfer {...other} />
  }

  if (type === 'ADDRESS_FUNDING_FROM_ASSET_LOCK') {
    return <AddressFundingFromAssetLock {...other} />
  }

  if (type === 'ADDRESS_CREDIT_WITHDRAWAL') {
    return <AddressCreditWithdrawal {...other} />
  }

  if (type === 'SHIELD') {
    return <Shield {...other} />
  }

  if (type === 'SHIELDED_TRANSFER') {
    return <ShieldedTransfer {...other} />
  }

  if (type === 'UNSHIELD') {
    return <Unshield {...other} />
  }

  if (type === 'SHIELD_FROM_ASSET_LOCK') {
    return <ShieldFromAssetLock {...other} />
  }

  if (type === 'SHIELDED_WITHDRAWAL') {
    return <ShieldedWithdrawal {...other} />
  }

  if (type === 'IDENTITY_CREATE_FROM_SHIELDED_POOL') {
    return <IdentityCreateFromShieldedPool {...other} />
  }

  // Unknown type: show the raw payload instead of an empty Details section.
  if (other.raw) {
    return (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title='Raw Transaction'
        value={
          <ValueCard className='TransactionPage__RawTransaction'>
            <Identifier copyButton ellipsis styles={['highlight-both']}>
              {other.raw}
            </Identifier>
          </ValueCard>
        }
      />
    )
  }

  return <></>
}
