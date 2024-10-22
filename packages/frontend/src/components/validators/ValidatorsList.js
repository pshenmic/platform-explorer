'use client'

import { useState } from 'react'
import { ListColumnsHeader } from '../ui/lists'
import Link from 'next/link'
import { LoadingLine } from '../loading'
import { Identifier } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import './ValidatorsList.scss'
import './ValidatorListItem.scss'

const ValidatorListItem = ({ validator, loading }) => {
  return (
    !loading
      ? <Link
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
      : <LoadingLine loading={loading} className={'ValidatorListItem ValidatorListItem--Loading'}/>
  )
}

export default function ValidatorsList ({ validators, pageSize }) {
  const [sort, setSort] = useState({ key: 'blocksProposed', direction: 'asc' })

  function getSortedList () {
    if (!validators?.data?.resultSet?.length) return []

    return validators.data.resultSet.sort((a, b) => {
      if (sort.key === 'lastBlockHeight') {
        return (a?.lastProposedBlockHeader?.height || 0) > (b?.lastProposedBlockHeader?.height || 0)
          ? sort.direction === 'asc' ? 1 : -1
          : sort.direction === 'asc' ? -1 : 1
      }

      return a[sort.key] > b[sort.key]
        ? sort.direction === 'asc' ? 1 : -1
        : sort.direction === 'asc' ? -1 : 1
    })
  }

  const headers = [
    {
      key: 'hash',
      label: 'proTxHash'
    },
    {
      key: 'lastBlockHeight',
      label: 'Last block height',
      isNumeric: true,
      sortable: true
    },
    {
      key: 'proposedBlocksAmount',
      label: 'Blocks proposed',
      isNumeric: true,
      sortable: true
    }
  ]

  return (
    <div className={'ValidatorsList'}>
      <div className={'ValidatorsList__ContentContainer'}>
        <ListColumnsHeader
          columns={headers}
          sortCallback={setSort}
          className={'ValidatorsList__ColumnTitles'}
          columnClassName={'ValidatorsList__ColumnTitle'}
        />

        {!validators?.loading
          ? getSortedList().map((validator, i) => <ValidatorListItem key={i} validator={validator}/>)
          : Array.from({
            length: String(pageSize).toLowerCase() === 'all'
              ? 50
              : pageSize
          }, (x, i) => (
            <ValidatorListItem key={i} loading={true}/>
          ))
        }
      </div>
    </div>
  )
}
