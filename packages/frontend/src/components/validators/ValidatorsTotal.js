'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import { InfoCard, ValueCard } from '../cards'
import EpochProgress from '../networkStatus/EpochProgress'
import { Identifier } from '../data'
import './ValidatorsTotal.scss'
import './ValidatorsTotalCard.scss'

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
    <div className={'ValidatorsTotal'}>
      <InfoCard link={'/'} className={'ValidatorsTotalCard'} loading={status.loading}>
        <div className={'ValidatorsTotalCard__Title'}>Epoch</div>
        <div className={'ValidatorsTotalCard__Value'}>
          {typeof status?.data?.epoch?.number === 'number'
            ? status.data.epoch.number
            : 'n/a'}
        </div>
        {status?.data?.epoch && <EpochProgress epoch={status.data.epoch}/>}
      </InfoCard>
      <InfoCard link={'/'} className={'ValidatorsTotalCard'} loading={status.loading}>
        <div className={'ValidatorsTotalCard__Title'}>Best Validator</div>
        <ValueCard>
          <Identifier avatar={true} copyButton={true}>{epoch?.data?.bestValidator || 'n/a'}</Identifier>
        </ValueCard>
      </InfoCard>
      <InfoCard link={'/'} className={'ValidatorsTotalCard'} loading={status.loading}>
        <div className={'ValidatorsTotalCard__Title'}>Fees collected</div>
        <div className={'ValidatorsTotalCard__Value'}>
          {typeof status?.data?.epoch?.number === 'number'
            ? currencyRound(epoch.data.totalCollectedFees)
            : 'n/a'}
        </div>
      </InfoCard>
      <InfoCard link={'/'} className={'ValidatorsTotalCard'} loading={status.loading}>
        <div className={'ValidatorsTotalCard__Title'}>Total validators</div>
        <div className={'ValidatorsTotalCard__Value'}>
          {typeof validators?.data?.pagination?.total === 'number'
            ? validators.data.pagination.total
            : 'n/a'}
          </div>
      </InfoCard>
    </div>
  )

  // return (
  //   <TotalCards
  //     cards={[
  //       {
  //         title: 'Epoch:',
  //         value: typeof status?.data?.epoch?.number === 'number' ? status.data.epoch.number : 'n/a',
  //         icon: 'Sandglass',
  //         loading: status.loading
  //       },
  //       {
  //         title: 'Total Validators:',
  //         value: typeof validators?.data?.pagination?.total === 'number' ? validators.data.pagination.total : 'n/a',
  //         icon: 'Nodes',
  //         loading: validators.loading
  //       },
  //       {
  //         title: 'Fees collected:',
  //         value: typeof status?.data?.epoch?.number === 'number' ? currencyRound(epoch.data.totalCollectedFees) : 'n/a',
  //         icon: 'Coins',
  //         loading: epoch.loading
  //       },
  //       {
  //         title: 'Best Validator:',
  //         value: epoch?.data?.bestValidator || 'n/a',
  //         icon: 'StarCheck',
  //         loading: epoch.loading,
  //         link: epoch?.data?.bestValidator ? `/validator/${epoch.data.bestValidator}` : '',
  //         format: ['elipsed']
  //       }
  //     ]}
  //   />
  // )
}
