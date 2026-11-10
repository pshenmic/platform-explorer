'use client'

import { useEffect, useState } from 'react'
import { focusManager, onlineManager, useQuery } from '@tanstack/react-query'
import { getStatus } from '../../../util/Api'
import { networkHealth } from '../networkHealth'

export function useHomeStatus() {
  const query = useQuery({
    queryKey: ['home', 'status'],
    queryFn: getStatus,
    refetchInterval: 60_000
  })
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const timer = setInterval(tick, 15_000)
    // Query handles revalidation itself; these subscriptions only update the age display.
    const offFocus = focusManager.subscribe(tick)
    const offOnline = onlineManager.subscribe(tick)
    return () => {
      clearInterval(timer)
      offFocus()
      offOnline()
    }
  }, [])
  const health = networkHealth({
    status: query.data,
    updatedAt: query.dataUpdatedAt,
    now: Math.max(now, Date.now()),
    fetching: query.isFetching,
    error: query.isError,
    pending: query.isPending
  })
  return { query, health }
}
