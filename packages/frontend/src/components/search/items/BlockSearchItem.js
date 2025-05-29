import { Badge, Flex } from '@chakra-ui/react'
import { BlockIcon } from '../../ui/icons'
import { Identifier, NotActive, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function BlockSearchItem ({ block, className, onClick }) {
  return (
    <BaseSearchItem
      href={`/block/${block?.header?.hash}`}
      className={`${className || ''}`}
      gridClassModifier={'Block'}
      onClick={onClick}
      data={block}
    >
      <BaseSearchItemContent
        mainContent={
          <Flex alignItems={'center'} w={'100%'}>
            <BlockIcon className={'SearchResultsListItem__Icon'}/>
            <Identifier ellipsis={true} styles={['highlight-both']}>{block?.header?.hash}</Identifier>
          </Flex>
        }
        additionalContent={
          block?.header?.height ?? null
            ? <Badge size={'xs'} colorScheme={'gray'}>
                #{block?.header?.height}
              </Badge>
            : <NotActive>-</NotActive>
        }
        timestamp={<TimeDelta endDate={block?.header?.timestamp}/>}
      />
    </BaseSearchItem>
  )
}
