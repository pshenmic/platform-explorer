'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { DashboardCards } from '../cards'
import {
  BestValidatorCardContent,
  EpochCardContent,
  FeesCollectedCardContent,
  TotalValidatorsCardContent
} from '../cards/dashboard'

export default function ValidatorsDashboardCards () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)

        Api.getEpoch(res?.epoch?.number)
          .then(res => fetchHandlerSuccess(setEpoch, res))
          .catch(err => fetchHandlerError(setEpoch, err))
      })
      .catch(err => fetchHandlerError(setStatus, err))

    Api.getValidators(1, 10)
      .then(res => fetchHandlerSuccess(setValidators, res))
      .catch(err => fetchHandlerError(setValidators, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [])

  return (
    <DashboardCards
      className={'ValidatorsTotal'}
      cards={[
        {
          title: 'Epoch',
          value: <EpochCardContent status={status.data}/>,
          error: typeof status?.data?.epoch?.number !== 'number' && typeof status?.data?.epoch?.number !== 'string',
          loading: status.loading,
          className: 'ValidatorsTotalCard'
        },
        {
          title: 'Fees collected',
          value: <FeesCollectedCardContent epoch={epoch.data} status={status.data} rate={rate.data}/>,
          error: !epoch?.data && !status.data,
          loading: epoch.loading || status.loading
        },
        {
          title: 'Best Validator',
          value: <BestValidatorCardContent epoch={epoch.data}/>,
          loading: epoch.loading,
          error: !epoch?.data?.bestValidator
        },
        {
          title: 'Total Validators',
          value: <TotalValidatorsCardContent validators={validators}/>,
          className: 'ValidatorsTotalCard ValidatorsTotalCard--TotalValidators',
          loading: validators.loading,
          error: validators.data?.pagination?.total === undefined || validators.data?.pagination?.total === null
        }
      ]}
    />
  )
}
