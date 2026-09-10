import type { ComponentType, ReactNode } from 'react'
import ImageGeneratorJs from '../imageGenerator'
import {
  Alias as AliasJs,
  DateBlock as DateBlockJs,
  Identifier as IdentifierJs,
  InfoLine as InfoLineJs
} from '../data'
import { ValueCard as ValueCardJs } from '../cards'
import { findActiveAlias } from '../../util'
import { DataContractTitle } from './DataContractTitle'
import type { LoadableState, Owner, WithClassName } from '../../types'

import './DataContractTotalCard.css'

// Untyped JS components — loose wrappers until data/* and cards/* are migrated
const ImageGenerator = ImageGeneratorJs as ComponentType<{
  username?: string | null
  className?: string
  lightness?: number
  saturation?: number
  width?: number
  height?: number
}>
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  avatarSource?: string | null
  className?: string
  ellipsis?: boolean
}>
const DateBlock = DateBlockJs as ComponentType<{
  timestamp?: string | null
  format?: string
  showRelativeTooltip?: boolean
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

/** Enriched detail shape returned by GET /dataContract/:id (owner/topIdentity as objects). */
interface DataContractDetail {
  identifier?: string | null
  name?: string | null
  description?: string | null
  keywords?: string[] | null
  timestamp?: string | null
  txHash?: string | null
  owner?: Owner | string | null
}

interface DataContractTotalCardProps extends WithClassName {
  dataContract: LoadableState<DataContractDetail> | {
    data?: DataContractDetail | null
    loading?: boolean
    error?: unknown
  }
}

function DataContractTotalCard ({ dataContract, className }: DataContractTotalCardProps) {
  const owner = dataContract?.data?.owner
  const ownerId = typeof owner === 'object' && owner !== null ? owner.identifier : owner
  const ownerAliases = typeof owner === 'object' && owner !== null ? owner.aliases : undefined
  const activeAlias = findActiveAlias(ownerAliases)

  const titleData = dataContract.data && owner
    ? {
        identifier: dataContract.data.identifier ?? '',
        name: dataContract.data.name,
        description: dataContract.data.description,
        keywords: dataContract.data.keywords,
        owner
      }
    : null

  return (
    <div className={`InfoBlock InfoBlock--Gradient DataContractTotalCard ${dataContract.loading ? 'DataContractTotalCard--Loading' : ''} ${className || ''}`}>
      <DataContractTitle dataContract={titleData} />
      <div className={'DataContractTotalCard__Header'}>
        <div className={'DataContractTotalCard__HeaderLines'}>
          <InfoLine
            className={'DataContractTotalCard__Identifier'}
            title={'Identifier'}
            loading={dataContract.loading}
            error={dataContract.error || !dataContract.data?.identifier}
            value={
              <Identifier
                copyButton={true}
                styles={['highlight-both']}
                ellipsis={false}
              >
                {dataContract.data?.identifier}
              </Identifier>
            }
          />

          <InfoLine
            className={'DataContractTotalCard__Owner'}
            title={'Owner'}
            loading={dataContract.loading}
            error={dataContract.error}
            value={
              <ValueCard link={`/identity/${ownerId}`}>
                {activeAlias
                  ? <Alias avatarSource={ownerId}>{activeAlias.alias}</Alias>
                  : <Identifier
                    avatar={true}
                    className={''}
                    copyButton={true}
                    styles={['highlight-both']}
                    ellipsis={false}
                  >
                    {ownerId}
                  </Identifier>
                }
              </ValueCard>
            }
          />

          <InfoLine
            className={'DataContractTotalCard__Keywords'}
            title={'Keywords'}
            loading={dataContract.loading}
            error={dataContract.error || !dataContract.data?.keywords?.length}
            value={
              <div className={'DataContractTotalCard__KeywordsList'}>
                {dataContract.data?.keywords?.map((kw, i) => (
                  <ValueCard key={i}>{kw}</ValueCard>
                ))}
              </div>
            }
          />

          <InfoLine
            className={'DataContractTotalCard__InfoLine DataContractTotalCard__InfoLine--Description'}
            title={'Description'}
            loading={dataContract.loading}
            error={dataContract.error || !dataContract.data?.description}
            value={
              <ValueCard className={'DataContractTotalCard__DescriptionValue'}>
                {dataContract.data?.description}
              </ValueCard>
            }
          />

          <InfoLine
            className={'DataContractTotalCard__CreationDate'}
            title={'Creation Date'}
            loading={dataContract.loading}
            error={dataContract.error}
            value={dataContract?.data?.txHash
              ? <ValueCard link={`/transaction/${dataContract.data?.txHash}`}>
                  <DateBlock timestamp={dataContract.data?.timestamp}/>
                </ValueCard>
              : <DateBlock timestamp={dataContract.data?.timestamp}/>
            }
          />
        </div>
        <div className={'DataContractTotalCard__Avatar'}>
          {!dataContract.error
            ? <ImageGenerator
              username={dataContract.data?.identifier}
              lightness={50}
              saturation={50}
              width={88}
              height={88}
            />
            : 'n/a'
          }
        </div>
      </div>
    </div>
  )
}

export default DataContractTotalCard
