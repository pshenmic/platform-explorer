import { Badge } from '@chakra-ui/react'
import { BlockIcon } from '../../ui/icons'
import { Identifier, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function BlockSearchItem ({ block, className }) {
  return (
    <BaseSearchItem
      href={`/block/${block?.header?.hash}`}
      className={className}
    >
      <BaseSearchItemContent
        mainContent={
          <>
            <BlockIcon className={'SearchResultsListItem__Icon'}/>
            <Identifier ellipsis={true} styles={['highlight-both']}>{block?.header?.hash}</Identifier>
          </>
        }
        additionalContent={
          <Badge size={'xs'} colorScheme={'gray'}>
            #{block?.header?.height || '0'}
          </Badge>
        }
        timestamp={<TimeDelta endDate={block?.timestamp || new Date()}/>}
      />
    </BaseSearchItem>
  )
}
