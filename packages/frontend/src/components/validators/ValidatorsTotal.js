'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import TotalCards from '../total/TotalCards'
import { currencyRound } from '../../util'

export default function ValidatorsTotal () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)
        
        Api.getEpoch(res?.epoch?.index)
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
          value: status?.data?.epoch?.index || 'n/a',
          icon: 'Sandglass',
          loading: status.loading
        },
        {
          title: 'Total Validators:',
          value: validators?.data?.pagination?.total || 'n/a',
          icon: 'Nodes',
          loading: validators.loading
        },
        {
          title: 'Fees collected:',
          value: currencyRound(epoch?.data?.totalCollectedFees) || 'n/a',
          icon: 'Coins',
          loading: epoch.loading
        },
        {
          title: 'Best Validator:',
          value: epoch?.data?.bestValidator || 'n/a',
          icon: 'StarCheck',
          loading: epoch.loading,
          link: epoch?.data?.bestValidator ? `/validator/${epoch?.data?.bestValidator}` : '',
          format: ['elipsed']
        }
      ]}
    />
  )
}
