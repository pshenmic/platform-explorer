import Link from 'next/link'
import { Identifier } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'

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
              {validator?.lastProposedBlockHeader?.height || '-'}
            </GridItem>
            <GridItem className={'ValidatorListItem__Column'}>
              {validator?.proposedBlocksAmount || '-'}
            </GridItem>
          </Grid>
        </Link>
  )
}
