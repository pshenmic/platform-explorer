'use client'

import { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { getTokenName } from '../../util'
import { CardHead } from '../cards'
import { SimpleList, EmptyListMessage } from '../ui/lists'
import { LoadingList } from '../loading'

const LIMIT = 10
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days, same window as tokens/TokensTrending

// top tokens by transitions count over the trailing 30 days, SimpleList table (not the /tokens marquee)
export default function TrendingTokens ({ enabled = true }) {
  const [state, setState] = useState({ loading: true, error: false, items: [] })

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: false }))
    const end = new Date()
    const start = new Date(end.getTime() - WINDOW_MS)
    Api.getTokensRating(1, LIMIT, 'desc', {
      timestamp_start: start.toISOString(),
      timestamp_end: end.toISOString()
    })
      .then(res => setState({ loading: false, error: false, items: res?.resultSet ?? [] }))
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [enabled])

  const { loading, error, items } = state

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder TrendingTokens'} w={'100%'}>
      <CardHead title={'Trending tokens'}/>

      {loading
        ? <LoadingList itemsCount={6}/>
        : error || !items.length
          ? <EmptyListMessage>No data</EmptyListMessage>
          : <SimpleList
              items={items.map(item => ({
                columns: [
                  { value: getTokenName(item.localizations), avatar: true, avatarSource: item.tokenIdentifier },
                  { value: item.transitionCount }
                ],
                link: `/token/${item.tokenIdentifier}`
              }))}
              columns={['Token', 'Transitions']}
            />}
    </Box>
  )
}
