import { Badge } from '@chakra-ui/react'
import { Identifier } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function ValidatorSearchItem ({ validator, className }) {
  return (
    <BaseSearchItem
      href={`/validator/${validator?.proTxHash}`}
      className={'SearchResultsListItem--validator ' + (className || '')}
    >
      <BaseSearchItemContent
        mainContent={
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{validator?.proTxHash}</Identifier>
        }
        additionalContent={
          <Identifier avatar={true} ellipsis={true}>{validator?.identity || 'Unknown'}</Identifier>
        }
        timestamp={
          <Badge size={'xs'} colorScheme={'blue'}>{validator?.balance || '1000'} DASH</Badge>
        }
      />
    </BaseSearchItem>
  )
}
