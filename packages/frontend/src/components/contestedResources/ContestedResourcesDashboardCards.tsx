'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { DashboardCards } from '../cards'
import { SignatureIcon, ListIcon, CalendarGradientIcon } from '../ui/icons'
import { ContestedResourceContent } from '../cards/dashboard'
import type { ContestedResourcesStatus, LoadableState } from '../../types'
import './ContestedResourcesDashboardCards.scss'

function ContestedResourcesDashboardCards () {
  const [stats, setStats] = useState<LoadableState<ContestedResourcesStatus | Record<string, unknown>>>({
    data: {},
    loading: true,
    error: false
  })

  const fetchData = () => {
    Api.getContestedResourcesStats()
      .then(res => fetchHandlerSuccess(setStats, res))
      .catch(err => fetchHandlerError(setStats, err))
  }

  useEffect(fetchData, [])

  const data = stats.data as ContestedResourcesStatus | null

  return (
    <DashboardCards
      cards={[
        {
          title: 'Total Contested Resources',
          value: data?.totalContestedResources,
          className: 'ContestedResourcesDashboardCards__Card',
          error: stats.error,
          loading: stats.loading,
          icon: SignatureIcon
        },
        {
          title: 'Total Votes Casted',
          value: data?.totalVotesCount,
          className: 'ContestedResourcesDashboardCards__Card',
          error: stats.error,
          loading: stats.loading,
          icon: ListIcon
        },
        {
          title: 'Pending Contested Resources',
          value: data?.totalPendingContestedResources,
          className: 'ContestedResourcesDashboardCards__Card',
          error: stats.error,
          loading: stats.loading,
          icon: SignatureIcon
        },
        {
          title: 'Ending soon',
          value: <ContestedResourceContent contestedResource={data?.expiringContestedResource as Parameters<typeof ContestedResourceContent>[0]['contestedResource']}/>,
          className: 'ContestedResourcesDashboardCards__Card',
          error: stats.error,
          loading: stats.loading,
          icon: CalendarGradientIcon
        }
      ]}
    />
  )
}

export default ContestedResourcesDashboardCards
