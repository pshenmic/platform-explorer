import Link from 'next/link'
import { DateBlock, Identifier, NotActive } from '../data'
import { Badge, Grid, GridItem } from '@chakra-ui/react'

import './ValidatorListItem.scss'

export const ValidatorListItem = ({ validator }) => {
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
