'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { SimpleList, EmptyListMessage } from '../ui/lists'
import { LoadingList } from '../loading'

const LIMIT = 5

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

  if (loading) return <LoadingList itemsCount={LIMIT}/>
  if (error || !items.length) return <EmptyListMessage>No data</EmptyListMessage>

  return (
    <SimpleList
      items={items.map((item, i) => ({
        place: i + 1,
        columns: [
          { value: item.identifier, format: 'identifier', avatar: true, avatarSource: item.identifier },
          { value: item.transitionsCount }
        ],
        link: `/dataContract/${item.identifier}`
      }))}
      columns={['Contract', 'Transitions']}
    />
  )
}
