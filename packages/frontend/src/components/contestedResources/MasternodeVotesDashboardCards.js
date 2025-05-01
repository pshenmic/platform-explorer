'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { DashboardCards } from '../cards'
import { SignatureTopIcon, PercentHandIcon, ListIcon } from '../ui/icons'
import { ExpiringContestedResourceContent } from '../cards/dashboard'
import './MasternodeVotesDashboardCards.scss'

function MasternodeVotesDashboardCards () {
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getEpoch()
      .then(res => fetchHandlerSuccess(setEpoch, res))
      .catch(err => fetchHandlerError(setEpoch, err))
  }

  console.log('epoch', epoch)

  useEffect(fetchData, [])

  return (
    <DashboardCards
      cards={[
        {
          title: `Total Votes Epoch ${epoch.data?.epoch?.number ? `#${epoch.data.epoch.number}` : ''}`,
          value: epoch.data?.totalVotesCount,
          className: 'ContestedResourcesDashboardCards__Card',
          error: epoch.error,
          loading: epoch.loading,
          icon: ListIcon
        },
        {
          title: 'Top Voter',
          value: epoch.data?.bestVoter?.identifier,
          className: 'ContestedResourcesDashboardCards__Card',
          error: epoch.error,
          loading: epoch.loading
          // icon: ListIcon
        },
        {
          title: 'Pending Contested Resources',
          value: epoch.data?.totalPendingContestedResources,
          className: 'ContestedResourcesDashboardCards__Card',
          error: epoch.error,
          loading: epoch.loading,
          icon: PercentHandIcon
        },
        {
          title: 'Ending soon',
          value: <ExpiringContestedResourceContent contestedResource={epoch.data?.expiringContestedResource}/>,
          className: 'ContestedResourcesDashboardCards__Card',
          error: epoch.error,
          loading: epoch.loading,
          icon: SignatureTopIcon
        }
      ]}
    />
  )
}

export default MasternodeVotesDashboardCards
