import type { ComponentType, ReactNode } from 'react'
import type { Validator } from '../../types'
import type { LoadableState } from '../../types/common'
import Link from 'next/link'
import { DateBlock as DateBlockJs, Identifier as IdentifierJs, NotActive as NotActiveJs } from '../data'
import { Badge, Grid, GridItem } from '@chakra-ui/react'

import './ValidatorListItem.css'

// Untyped JS modules — cast until migrated
const DateBlock = DateBlockJs as ComponentType<{
  timestamp?: string | number | null
  format?: string
  showTime?: boolean
  showRelativeTooltip?: boolean
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  ellipsis?: boolean
  middleEllipsis?: boolean
  copyButton?: boolean
  styles?: string[]
  clickable?: boolean
  alias?: string
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>

interface ValidatorListItemProps {
  validator: Validator
}

export const ValidatorListItem = ({ validator }: ValidatorListItemProps) => {
  return (
    <Link
        href={`/validator/${validator.proTxHash}`}
        className={'ValidatorListItem'}
    >
        <Grid className={'ValidatorListItem__Content'}>
            <GridItem className={'ValidatorListItem__Column'}>
                {validator?.proTxHash &&
                <Identifier
                    className={'ValidatorListItem__Column ValidatorListItem__Column--Identifier'}
                    avatar={true}
                    copyButton={true}
                    styles={['highlight-both']}
                >
                    {validator.proTxHash}
                </Identifier>
                }
            </GridItem>
            <GridItem className={'ValidatorListItem__Column'}>
              {validator?.isActive !== undefined
                ? <Badge className='ValidatorListItem__Column--Active' colorScheme={validator?.isActive ? 'orange' : 'gray'}>
                    {validator?.isActive ? 'true' : 'false'}
                </Badge>
                : <NotActive />
                }
            </GridItem>
            <GridItem className={'ValidatorListItem__Column'}>
                {validator?.lastProposedBlockHeader?.height || '-'}
            </GridItem>
            <GridItem className={'ValidatorListItem__Column'}>
                {validator?.proposedBlocksAmount || '-'}
            </GridItem>
            <GridItem className={'ValidatorListItem__Column'}>
                <DateBlock timestamp={validator.lastProposedBlockHeader?.timestamp} format='dateOnly' />
            </GridItem>
        </Grid>
    </Link>
  )
}
