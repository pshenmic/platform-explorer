import type { ComponentType, ReactNode } from 'react'
import type { Identity } from '../../../types'
import type { WithClassName } from '../../../types/common'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  Alias as AliasJs,
  Identifier as IdentifierJs,
  TimeDelta as TimeDeltaJs,
  NotActive as NotActiveJs
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
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>

const STATUS_COLORS: Record<string, string> = {
  ok: 'green',
  pending: 'orange',
  locked: 'red'
}

/** Search may return a single `alias` and nested `status` not on Identity model. */
type SearchIdentity = Partial<Identity> & {
  alias?: string | null
  status?: {
    status?: string | null
    timestamp?: string | null
  } | null
}

interface IdentitySearchItemProps extends WithClassName {
  identity?: SearchIdentity | null
  onClick?: (data: unknown) => void
}

export function IdentitySearchItem({ identity, className, onClick }: IdentitySearchItemProps) {
  return (
    <BaseSearchItem
      href={`/identity/${identity?.identifier}`}
      className={`${className || ''}`}
      gridClassModifier={'Identity'}
      onClick={onClick}
      data={identity}
    >
      <BaseSearchItemContent
        mainContent={
          identity?.alias ? (
            <Alias avatarSource={identity?.identifier} ellipsis={true}>
              {identity?.alias}
            </Alias>
          ) : (
            <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
              {identity?.identifier}
            </Identifier>
          )
        }
        additionalContent={
          identity?.status?.status ? (
            <span className={`Badge Badge--${STATUS_COLORS[identity?.status?.status] || 'gray'}`}>
              {identity?.status?.status}
            </span>
          ) : (
            <NotActive>-</NotActive>
          )
        }
        timestamp={
          <TimeDelta
            endDate={
              identity?.status?.timestamp
                ? new Date(identity?.status?.timestamp)
                : identity?.timestamp
                  ? new Date(identity.timestamp)
                  : undefined
            }
          />
        }
      />
    </BaseSearchItem>
  )
}
