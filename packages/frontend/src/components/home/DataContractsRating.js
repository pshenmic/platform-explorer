'use client'

import { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { CardHead } from '../cards'
import { SimpleList, EmptyListMessage } from '../ui/lists'
import { LoadingList } from '../loading'

const LIMIT = 10

// top data contracts by state transitions count — a static leaderboard, no time-range presets
export default function DataContractsRating ({ enabled = true }) {
  const [state, setState] = useState({ loading: true, error: false, items: [] })

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: false }))
    Api.getDataContractsRating(1, LIMIT, 'desc')
      .then(res => setState({ loading: false, error: false, items: res?.resultSet ?? [] }))
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [enabled])

  const { loading, error, items } = state

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder DataContractsRating'} w={'100%'}>
      <CardHead title={'Data contracts rating'}/>

      {loading
        ? <LoadingList itemsCount={6}/>
        : error || !items.length
          ? <EmptyListMessage>No data</EmptyListMessage>
          : <SimpleList
              items={items.map(item => ({
                columns: [
                  { value: item.identifier, format: 'identifier' },
                  { value: item.transitionsCount }
                ],
                link: `/dataContract/${item.identifier}`
              }))}
              columns={['Identifier', 'Transitions']}
            />}
    </Box>
  )
}
