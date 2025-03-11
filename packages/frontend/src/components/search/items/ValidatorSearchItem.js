import { BigNumber, Identifier, NotActive } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function ValidatorSearchItem ({ validator, className }) {
  return (
    <BaseSearchItem
      href={`/validator/${validator?.proTxHash}`}
      className={'SearchResultsListItem--Validator ' + (className || '')}
    >
      <BaseSearchItemContent
        mainContent={
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{validator?.proTxHash}</Identifier>
        }
        additionalContent={
          <Identifier avatar={!!validator?.identity} ellipsis={true}>{validator?.identity || '-'}</Identifier>
        }
        timestamp={
          validator?.identityBalance !== undefined && validator?.identityBalance !== null
            ? <>
              <BigNumber>{validator?.identityBalance}</BigNumber> DASH
            </>
            : <NotActive/>
        }
      />
    </BaseSearchItem>
  )
}
