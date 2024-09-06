'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import TotalCards from '../total/TotalCards'

export default function ValidatorsTotal () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)

        Api.getEpoch(res?.epoch?.number)
          .then(res => fetchHandlerSuccess(setEpoch, res))
          .catch(err => fetchHandlerError(setEpoch, err))
      })
      .catch(err => fetchHandlerError(setStatus, err))

    Api.getValidators(1, 1)
      .then(res => fetchHandlerSuccess(setValidators, res))
      .catch(err => fetchHandlerError(setValidators, err))
  }

  useEffect(fetchData, [])

  return (
    <TotalCards
      cards={[
        {
          title: 'Epoch:',
          value: typeof status?.data?.epoch?.number === 'number' ? status.data.epoch.number : 'n/a',
          icon: 'Sandglass',
          loading: status.loading
        },
        {
          title: 'Total Validators:',
          value: typeof validators?.data?.pagination?.total === 'number' ? validators.data.pagination.total : 'n/a',
          icon: 'Nodes',
          loading: validators.loading
        },
        {
          title: 'Fees collected:',
          value: typeof status?.data?.epoch?.number === 'number' ? currencyRound(epoch.data.totalCollectedFees) : 'n/a',
          icon: 'Coins',
          loading: epoch.loading
        },
        {
          title: 'Best Validator:',
          value: epoch?.data?.bestValidator || 'n/a',
          icon: 'StarCheck',
          loading: epoch.loading,
          link: epoch?.data?.bestValidator ? `/validator/${epoch.data.bestValidator}` : '',
          format: ['elipsed']
        }
      ]}
    />
  )
}
