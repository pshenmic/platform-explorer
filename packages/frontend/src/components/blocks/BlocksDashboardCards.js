'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import { DashboardCards } from '../cards'
import { EpochTooltip } from '../ui/Tooltips'
import { InfoIcon } from '@chakra-ui/icons'
import EpochProgress from '../networkStatus/EpochProgress'
import { NotActive } from '../data'
import { BlockIcon, HourglassIcon, TransactionsIcon } from '../ui/icons'

export default function BlocksDashboardCards () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })

  console.log('epoch', epoch)
  console.log('status', status)

  const fetchData = () => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)

        Api.getEpoch(res?.epoch?.number)
          .then(res => fetchHandlerSuccess(setEpoch, res))
          .catch(err => fetchHandlerError(setEpoch, err))
      })
      .catch(err => fetchHandlerError(setStatus, err))
  }

  useEffect(fetchData, [])

  return (
    <DashboardCards
      cards={[
        {
          title: 'Epoch',
          value: (
            <div>
              {typeof status?.data?.epoch?.number === 'number'
                ? <EpochTooltip epoch={status.data.epoch}>
                  <div className={'BlocksDashboardCard__EpochNumber'}>
                    #{status.data.epoch.number}
                    <InfoIcon ml={2} color={'brand.light'} boxSize={4}/>
                  </div>
                </EpochTooltip>
                : <NotActive/>}

              {status?.data?.epoch &&
              <EpochProgress epoch={status.data.epoch} className={'BlocksDashboardCard__EpochProgress'}/>}
            </div>
          ),
          loading: status.loading,
          tooltip: status?.data?.epoch
            ? { data: status.data.epoch }
            : null
        },
        {
          title: 'Avg. TPS',
          value: typeof epoch?.data?.tps === 'number'
            ? epoch.data.tps.toFixed(4)
            : <NotActive/>,
          loading: status.loading,
          icon: HourglassIcon
        },
        {
          title: 'Blocks',
          value: typeof status?.data?.api?.block?.height === 'number'
            ? currencyRound(status.data.api.block.height)
            : <NotActive/>,
          loading: status.loading,
          icon: BlockIcon
        },
        {
          title: 'Transactions',
          value: (
            typeof status.data?.transactionsCount === 'number' || typeof status.data?.transactionsCount === 'string'
              ? currencyRound(status.data?.transactionsCount)
              : <NotActive/>
          ),
          loading: false,
          icon: TransactionsIcon
        }
      ]}
    />
  )
}
