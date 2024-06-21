'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import TotalCards from '../total/TotalCards'
import { SideBlock } from '../containers'

export default function BlocksTotal () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))
  }

  useEffect(fetchData, [])

  return (
    <SideBlock>
      <TotalCards
        loading={status.loading}
        cards={[
          {
            title: 'Epoch:',
            value: status?.data?.epoch?.index || '-',
            icon: 'Sandglass'
          },
          {
            title: 'Blocks:',
            value: currencyRound(status?.data?.api?.block?.height) || '-',
            icon: 'Blocks'
          },
          {
            title: 'Avg. TPS*:',
            value: 'n/a',
            icon: 'Timer'
          },
          {
            title: 'Transactions:',
            value: currencyRound(status?.data?.transactionsCount) || '-',
            icon: 'Transactions'
          }
        ]}
      />
    </SideBlock>
  )
}
