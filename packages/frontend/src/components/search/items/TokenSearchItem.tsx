import type { ComponentType, ReactNode } from 'react'
import type { Localization, Owner, Token } from '../../../types'
import type { WithClassName } from '../../../types/common'
// Untyped JS components — loose wrappers until data/* is migrated
import { Alias as AliasJs, Identifier as IdentifierJs, TimeDelta as TimeDeltaJs } from '../../data'
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

/** Search may enrich owner and include a display name. */
type SearchToken = Partial<Omit<Token, 'owner' | 'localizations'>> & {
  name?: string | null
  owner?: Owner | string | null
  localizations?: Record<string, Partial<Localization>> | null
}

interface TokenSearchItemProps extends WithClassName {
  token?: SearchToken | null
  onClick?: (data: unknown) => void
}

export function TokenSearchItem({ token, className, onClick }: TokenSearchItemProps) {
  const tokenName = token?.localizations?.en?.singularForm || token?.name
  const ownerId =
    typeof token?.owner === 'object' && token.owner
      ? token.owner.identifier
      : typeof token?.owner === 'string'
        ? token.owner
        : undefined

  return (
    <BaseSearchItem
      href={`/token/${token?.identifier}`}
      className={`${className || ''}`}
      gridClassModifier={'Token'}
      onClick={onClick}
      data={token}
    >
      <BaseSearchItemContent
        mainContent={
          tokenName ? (
            <Alias avatarSource={token?.identifier ?? undefined} ellipsis={true}>
              {tokenName}
            </Alias>
          ) : (
            <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
              {token?.identifier}
            </Identifier>
          )
        }
        additionalContent={
          <Identifier avatar={!!ownerId} ellipsis={true}>
            {ownerId || '-'}
          </Identifier>
        }
        timestamp={<TimeDelta endDate={token?.timestamp} />}
      />
    </BaseSearchItem>
  )
}
