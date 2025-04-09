'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import { DashboardCards } from '../cards'
import { SignatureIcon, ListIcon, CalendarGradientIcon } from '../ui/icons'
import { ExpiringContestedResourceContent } from "../cards/dashboard";
import './ContestedResourcesDashboardCards.scss'

function ContestedResourcesDashboardCards () {
  const [stats, setStats] = useState({ data: {}, loading: true, error: false })

  console.log('stats', stats)

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
          error: false,
          loading: false,
          icon: SignatureIcon
        },
        {
          title: 'Total Votes Casted',
          value: stats.data?.totalVotesCount,
          className: 'ContestedResourcesDashboardCards__Card',
          error: false,
          loading: false,
          icon: ListIcon
        },
        {
          title: 'Pending Contested Resources',
          value: stats.data?.totalPendingContestedResources,
          className: 'ContestedResourcesDashboardCards__Card',
          error: false,
          loading: false,
          icon: SignatureIcon
        },
        {
          title: 'Ending soon',
          value: <ExpiringContestedResourceContent contestedResource={stats.data?.expiringContestedResource}/>,
          error: false,
          loading: false,
          icon: CalendarGradientIcon
        }
      ]}
    />
  )
}

export default ContestedResourcesDashboardCards
