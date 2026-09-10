import type { ComponentType, ReactNode } from 'react'
import { DocumentIcon, TransactionsIcon } from '../ui/icons'
import {
  Alias as AliasJs,
  CreditsBlock as CreditsBlockJs,
  Identifier as IdentifierJs,
  InfoLine as InfoLineJs
} from '../data'
import { ValueCard as ValueCardJs } from '../cards'
import { findActiveAlias } from '../../util'
import type { LoadableState, Owner, Rate } from '../../types'
import './DataContractDigestCard.css'

// Untyped JS components — loose wrappers until data/* and cards/* are migrated
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  avatarSource?: string | null
  className?: string
  ellipsis?: boolean
}>
const CreditsBlock = CreditsBlockJs as ComponentType<{
  credits?: number | null
  rate?: unknown
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  copyButton?: boolean
  ellipsis?: boolean
  styles?: string[]
}>
const InfoLine = InfoLineJs as ComponentType<{
  title?: ReactNode
  value?: ReactNode
  icon?: ReactNode
  loading?: boolean
  error?: unknown
  postfix?: string
  className?: string
  align?: string
}>
const ValueCard = ValueCardJs as ComponentType<{
  children?: ReactNode
  link?: string
  className?: string
  clickable?: boolean
  loading?: boolean
  colorScheme?: string
  size?: string
}>

interface DataContractDigestData {
  documentsCount?: number | null
  identitiesInteracted?: number | null
  totalGasUsed?: number | null
  averageGasUsed?: number | null
  tokensCount?: number | null
  version?: number | null
  topIdentity?: (Owner & { name?: string | null }) | string | null
}

interface DataContractDigestCardProps {
  dataContract: LoadableState<DataContractDigestData> | {
    data?: DataContractDigestData | null
    loading?: boolean
    error?: unknown
  }
  rate?: LoadableState<Rate> | { data?: Rate | null } | null
  txCount?: number | null
}

function DataContractDigestCard ({ dataContract, rate, txCount }: DataContractDigestCardProps) {
  const topIdentity = dataContract?.data?.topIdentity
  const topIdentityObj = typeof topIdentity === 'object' && topIdentity !== null ? topIdentity : null
  const topIdentityId = topIdentityObj?.identifier ?? (typeof topIdentity === 'string' ? topIdentity : null)
  const topIdentityActiveAlias = findActiveAlias(topIdentityObj?.aliases)

  return (
    <div className={`DataContract__InfoBlock DataContract__DigestCard DataContractDigestCard ${dataContract.loading ? 'DataContractDigestCard--Loading' : ''}`}>
      <div className={'DataContractDigestCard__RowContainer'}>
        <div className={'DataContractDigestCard__InfoContainer'}>
          <InfoLine
            className={'DataContractDigestCard__InfoLine DataContractDigestCard__InfoLine--TotalTransactions'}
            title={(<span><TransactionsIcon/>Total transactions</span>)}
            value={txCount}
            loading={dataContract.loading}
            error={dataContract.error || txCount === undefined}
          />
        </div>

        <div className={'DataContractDigestCard__InfoContainer'}>
          <InfoLine
            className={'DataContractDigestCard__InfoLine DataContractDigestCard__InfoLine--DocumentsCount'}
            title={(<span><DocumentIcon/>Total Documents</span>)}
            value={dataContract.data?.documentsCount}
            loading={dataContract.loading}
            error={dataContract.error || dataContract.data?.documentsCount === undefined}
          />
        </div>
      </div>

      <InfoLine
        className={'DataContractDigestCard__InfoLine DataContractDigestCard__InfoLine--TopIdentity'}
        title={'Top Identity'}
        value={(
          <ValueCard link={`/identity/${topIdentityId}`}>
            {topIdentityActiveAlias
              ? <Alias avatarSource={topIdentityId}>{topIdentityActiveAlias.alias}</Alias>
              : <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {topIdentityId}
              </Identifier>
            }
          </ValueCard>
        )}
        loading={dataContract.loading}
        error={dataContract.error || !dataContract.data?.topIdentity}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Identities Interacted'}
        value={dataContract.data?.identitiesInteracted}
        loading={dataContract.loading}
        error={dataContract.error || !dataContract.data?.identitiesInteracted}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Total Gas Spent'}
        value={<CreditsBlock credits={dataContract.data?.totalGasUsed} rate={rate}/>}
        loading={dataContract.loading}
        error={dataContract.error}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Average Gas Spent'}
        value={<CreditsBlock credits={dataContract.data?.averageGasUsed} rate={rate}/>}
        loading={dataContract.loading}
        error={dataContract.error}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Tokens'}
        value={dataContract.data?.tokensCount}
        loading={dataContract.loading}
        error={dataContract.error || dataContract.data?.tokensCount == null}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Version'}
        value={dataContract.data?.version}
        loading={dataContract.loading}
        error={dataContract.error}
      />
    </div>
  )
}

export default DataContractDigestCard
