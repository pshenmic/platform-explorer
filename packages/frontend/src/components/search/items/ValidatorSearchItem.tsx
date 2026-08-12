import type { ComponentType, ReactNode } from 'react'
import type { Validator } from '../../../types'
import type { WithClassName } from '../../../types/common'
// Untyped JS components — loose wrappers until data/* is migrated
import { Identifier as IdentifierJs, NotActive as NotActiveJs } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'
import { currencyRound } from '../../../util'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>

interface ValidatorSearchItemProps extends WithClassName {
  validator?: Partial<Validator> | null
  onClick?: (data: unknown) => void
}

export function ValidatorSearchItem({ validator, className, onClick }: ValidatorSearchItemProps) {
  return (
    <BaseSearchItem
      href={`/validator/${validator?.proTxHash}`}
      className={`${className || ''}`}
      gridClassModifier={'Validator'}
      onClick={onClick}
      data={validator}
    >
      <BaseSearchItemContent
        mainContent={
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
            {validator?.proTxHash}
          </Identifier>
        }
        additionalContent={
          <Identifier avatar={!!validator?.identity} ellipsis={true}>
            {validator?.identity || '-'}
          </Identifier>
        }
        timestamp={
          validator?.identityBalance != null ? (
            `${currencyRound(validator.identityBalance)} Dash`
          ) : (
            <NotActive />
          )
        }
      />
    </BaseSearchItem>
  )
}
