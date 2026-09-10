import type { ComponentType, ReactNode } from 'react'
import type { Block } from '../../../types'
import type { WithClassName } from '../../../types/common'
import { Badge, Flex } from '@chakra-ui/react'
import { BlockIcon } from '../../ui/icons'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  Identifier as IdentifierJs,
  NotActive as NotActiveJs,
  TimeDelta as TimeDeltaJs
} from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>
const TimeDelta = TimeDeltaJs as ComponentType<{ endDate?: string | Date | null }>

interface BlockSearchItemProps extends WithClassName {
  block?: Partial<Block> | null
  onClick?: (data: unknown) => void
}

export function BlockSearchItem({ block, className, onClick }: BlockSearchItemProps) {
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
            <BlockIcon className={'SearchResultsListItem__Icon'} />
            <Identifier ellipsis={true} styles={['highlight-both']}>
              {block?.header?.hash}
            </Identifier>
          </Flex>
        }
        additionalContent={
          (block?.header?.height ?? null) ? (
            <Badge size={'xs'} colorScheme={'gray'}>
              #{block?.header?.height}
            </Badge>
          ) : (
            <NotActive>-</NotActive>
          )
        }
        timestamp={<TimeDelta endDate={block?.header?.timestamp} />}
      />
    </BaseSearchItem>
  )
}
