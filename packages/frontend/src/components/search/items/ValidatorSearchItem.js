import { Identifier, NotActive } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'
import { currencyRound } from '../../../util'

export function ValidatorSearchItem ({ validator, className, onClick }) {
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
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{validator?.proTxHash}</Identifier>
        }
        additionalContent={
          <Identifier avatar={!!validator?.identity} ellipsis={true}>{validator?.identity || '-'}</Identifier>
        }
        timestamp={
          validator?.identityBalance ?? null
            ? `${currencyRound(validator?.identityBalance)} Dash`
            : <NotActive/>
        }
      />
    </BaseSearchItem>
  )
}
