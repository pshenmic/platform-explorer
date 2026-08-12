import type { ComponentType, ReactNode } from 'react'
import type { DataContract, Owner } from '../../../types'
import type { WithClassName } from '../../../types/common'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  Alias as AliasJs,
  Identifier as IdentifierJs,
  TimeDelta as TimeDeltaJs
} from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  avatarSource?: string
  ellipsis?: boolean
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
}>
const TimeDelta = TimeDeltaJs as ComponentType<{ endDate?: string | Date | null }>

/** Search payload may enrich `owner` to a full Owner object. */
type SearchDataContract = Partial<Omit<DataContract, 'owner'>> & {
  owner?: Owner | string | null
}

interface DataContractSearchItemProps extends WithClassName {
  dataContract?: SearchDataContract | null
  onClick?: (data: unknown) => void
}

export function DataContractSearchItem ({ dataContract, className, onClick }: DataContractSearchItemProps) {
  const ownerId = typeof dataContract?.owner === 'object' && dataContract.owner
    ? dataContract.owner.identifier
    : (typeof dataContract?.owner === 'string' ? dataContract.owner : undefined)

  return (
    <BaseSearchItem
      href={`/dataContract/${dataContract?.identifier}`}
      className={`${className || ''}`}
      gridClassModifier={'DataContract'}
      onClick={onClick}
      data={dataContract}
    >
      <BaseSearchItemContent
        mainContent={
          dataContract?.name
            ? <Alias avatarSource={dataContract?.identifier} ellipsis={true}>{dataContract?.name}</Alias>
            : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{dataContract?.identifier}</Identifier>
        }
        additionalContent={
          <Identifier avatar={!!ownerId} ellipsis={true}>{ownerId || '-'}</Identifier>
        }
        timestamp={<TimeDelta endDate={dataContract?.timestamp}/>}
      />
    </BaseSearchItem>
  )
}
