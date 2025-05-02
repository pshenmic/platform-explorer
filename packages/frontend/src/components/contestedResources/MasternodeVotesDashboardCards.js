'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { DashboardCards } from '../cards'
import { SignatureTopIcon, PercentHandIcon, ListIcon } from '../ui/icons'
import { ContestedResourceContent, FeesCollectedCardContent, VoterCardContent } from '../cards/dashboard'
import './MasternodeVotesDashboardCards.scss'

function MasternodeVotesDashboardCards () {
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getEpoch()
      .then(res => fetchHandlerSuccess(setEpoch, res))
      .catch(err => fetchHandlerError(setEpoch, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [])

  return (
    <DashboardCards
      cards={[
        {
          title: `Total Votes Epoch ${epoch.data?.epoch?.number ? `#${epoch.data.epoch.number}` : ''}`,
          value: epoch.data?.totalVotesCount,
          className: 'MasternodeVotesDashboardCards__Card',
          error: epoch.error,
          loading: epoch.loading,
          icon: ListIcon
        },
        {
          title: 'Top Voter',
          value: <VoterCardContent voter={epoch.data?.bestVoter}/>,
          className: 'MasternodeVotesDashboardCards__Card',
          error: epoch.error,
          loading: epoch.loading
        },
        {
          title: 'Fees Collected',
          value: <FeesCollectedCardContent epoch={epoch.data} rate={rate?.data}/>,
          className: 'MasternodeVotesDashboardCards__Card',
          error: epoch.error,
          loading: epoch.loading,
          icon: PercentHandIcon
        },
        {
          title: 'Top voted resource',
          value: <ContestedResourceContent
            nullMessage={'None'}
            contestedResource={epoch.data?.topVotedResource}
          />,
          className: 'MasternodeVotesDashboardCards__Card',
          error: epoch.error,
          loading: epoch.loading,
          icon: SignatureTopIcon
        }
      ]}
    />
  )
}

export default MasternodeVotesDashboardCards
