'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import TotalCards from '../total/TotalCards'

export default function ValidatorsTotal () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))
  }

  useEffect(fetchData, [])

  return (
    <TotalCards
      loading={status.loading}
      cards={[
        {
          title: 'Epoch:',
          value: status?.data?.epoch?.index || '-',
          icon: 'Sandglass'
        },
        {
          title: 'Total Validators:',
          value: 30,
          icon: 'Nodes'
        },
        {
          title: 'Fees collected:',
          value: currencyRound(716253447) || '-',
          icon: 'Coins'
        },
        {
          title: 'Best Validator:',
          value: 'f92e66c8',
          icon: 'StarCheck'
        }
      ]}
    />
  )
}
