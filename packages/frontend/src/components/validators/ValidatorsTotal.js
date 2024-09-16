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
      <InfoCard className={'ValidatorsTotalCard'} loading={status.loading}>
        <div className={'ValidatorsTotalCard__Title'}>Epoch</div>
        <div className={'ValidatorsTotalCard__Value'}>
          {typeof status?.data?.epoch?.number === 'number'
            ? <div className={'ValidatorsTotalCard__EpochNumber'}>#{status.data.epoch.number}</div>
            : 'n/a'}
        </div>
        {status?.data?.epoch && <EpochProgress epoch={status.data.epoch} className={'ValidatorsTotalCard__EpochProgress'}/>}
      </InfoCard>
      <InfoCard
        className={'ValidatorsTotalCard ValidatorsTotalCard--BestValidator'}
        loading={status.loading}
      >
        <div className={'ValidatorsTotalCard__Title'}>Best Validator</div>
        <ValueCard
          link={epoch?.data?.bestValidator ? `/validator/${epoch?.data?.bestValidator}` : undefined}
          className={'ValidatorsTotalCard__Value'}
        >
          {epoch?.data?.bestValidator
            ? <Identifier avatar={true} copyButton={true} styles={['gradient-start']}>
                {epoch.data.bestValidator}
              </Identifier>
            : 'n/a'
          }
        </ValueCard>
      </InfoCard>
      <InfoCard className={'ValidatorsTotalCard'} loading={status.loading}>
        <div className={'ValidatorsTotalCard__Title'}>Fees collected</div>
        <div className={'ValidatorsTotalCard__Value'}>
          {typeof epoch?.data?.totalCollectedFees === 'number'
            ? currencyRound(epoch.data.totalCollectedFees)
            : 'n/a'}
        </div>
      </InfoCard>
      <InfoCard className={'ValidatorsTotalCard'} loading={validators.loading}>
        <div className={'ValidatorsTotalCard__Title'}>Total validators</div>
        <div className={'ValidatorsTotalCard__Value'}>
          {typeof validators?.data?.pagination?.total === 'number'
            ? validators.data.pagination.total
            : 'n/a'}
          </div>
      </InfoCard>
    </div>
  )
}
