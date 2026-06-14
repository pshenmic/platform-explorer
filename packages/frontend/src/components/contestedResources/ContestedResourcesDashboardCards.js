'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { DashboardCards } from '../cards'
import { SignatureIcon, ListIcon, CalendarGradientIcon } from '../ui/icons'
import { ContestedResourceContent } from '../cards/dashboard'
import './ContestedResourcesDashboardCards.scss'

function ContestedResourcesDashboardCards () {
  const [stats, setStats] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getContestedResourcesStats()
      .then(res => fetchHandlerSuccess(setStats, res))
      .catch(err => fetchHandlerError(setStats, err))
  }

  useEffect(fetchData, [])

  return (
    <DashboardCards
      cards={[
        {
          title: 'Total Contested Resources',
          value: stats.data?.totalContestedResources,
          className: 'ContestedResourcesDashboardCards__Card',
          error: stats.error,
          loading: stats.loading,
          icon: SignatureIcon
        },
        {
          title: 'Total Votes Casted',
          value: stats.data?.totalVotesCount,
          className: 'ContestedResourcesDashboardCards__Card',
          error: stats.error,
          loading: stats.loading,
          icon: ListIcon
        },
        {
          title: 'Pending Contested Resources',
          value: stats.data?.totalPendingContestedResources,
          className: 'ContestedResourcesDashboardCards__Card',
          error: stats.error,
          loading: stats.loading,
          icon: SignatureIcon
        },
        {
          title: 'Ending soon',
          value: <ContestedResourceContent contestedResource={stats.data?.expiringContestedResource}/>,
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
