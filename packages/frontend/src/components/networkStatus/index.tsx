'use client'

import * as Api from '../../util/Api'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'
import EpochProgress from './EpochProgress'
import { Badge } from '@chakra-ui/react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { TimeDelta } from '../data'
import { EpochTooltip } from '../ui/Tooltips'
import Link from 'next/link'
import './NetworkStatus.scss'

function checkApiStatus (status) {
  if (!status?.data?.tenderdash?.block?.timestamp || !status?.data?.api?.block?.timestamp) return false

  const tenderdashTimestamp = new Date(status?.data?.tenderdash?.block?.timestamp).getTime()
  const apiTimestamp = new Date(status?.data?.api?.block?.timestamp).getTime()

  return !Number.isNaN(apiTimestamp) && !Number.isNaN(tenderdashTimestamp) &&
    Math.abs(apiTimestamp - tenderdashTimestamp) <= 10 * 60 * 1000
}

function NetworkStatus ({ className }) {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const lastBlockTimestamp = status?.data?.tenderdash?.block?.timestamp
  const msFromLastBlock = lastBlockTimestamp ? new Date() - new Date(lastBlockTimestamp) : null
  const networkStatus = msFromLastBlock !== null && msFromLastBlock / 1000 / 60 < 15
  const apiStatus = checkApiStatus(status)

  const fetchData = useCallback(() => {
    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))
      .finally(() => setTimeout(fetchData, 15000))
  }, [])

  useEffect(fetchData, [fetchData])

  const NetworkStatusIcon = networkStatus
    ? <CheckCircleIcon mr={2}/>
    : <WarningIcon mr={2}/>

  const ApiStatusIcon = apiStatus
    ? <CheckCircleIcon mr={2}/>
    : <WarningIcon mr={2}/>

  return (
    <div className={`NetworkStatus  ${className || ''}`}>
      <div align={['center', 'start', 'start', 'start', 'start']} className={`NetworkStatus__Stat NetworkStatus__Stat--Epoch ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>Epoch:</div>
        <div className={'NetworkStatus__InfoValue NetworkStatus__InfoValue--Epoch'}>
          {typeof status?.data?.epoch?.number === 'number'
            ? <EpochTooltip epoch={status.data.epoch}>
                <span>
                  #{status.data.epoch.number}
                  <InfoIcon ml={2} color={'brand.light'} boxSize={4}/>
                </span>
              </EpochTooltip>
            : 'n/a'}
          {status.data?.epoch &&
            <div className={'NetworkStatus__EpochProgress'}>
              <EpochProgress epoch={status.data.epoch}/>
            </div>
          }
        </div>
      </div>

      <div className={`NetworkStatus__Stat NetworkStatus__Stat--PlatformVersion ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>Platform version:</div>
        <div className={'NetworkStatus__InfoValue'}>{status?.data?.versions?.software?.drive !== undefined ? `v${status?.data?.versions?.software?.drive}` : '-'}</div>
      </div>

      <div className={`NetworkStatus__Stat NetworkStatus__Stat--TenderdashVersion ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>Tenderdash version:</div>
        <div className={'NetworkStatus__InfoValue'}>{status?.data?.versions?.software?.tenderdash ? `v${status?.data?.versions?.software?.tenderdash}` : '-'}</div>
      </div>

      <div align={'start'} className={`NetworkStatus__Stat NetworkStatus__Stat--Network ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>Network:</div>
        <div className={'NetworkStatus__InfoValue'}>
          <Badge colorScheme={networkStatus ? 'green' : 'red'} className={'NetworkStatus__Badge'}>
            {NetworkStatusIcon}
            {status?.data?.network ? `${status.data.network}` : 'n/a'}
          </Badge>
        </div>
      </div>

      <div align={'start'} className={`NetworkStatus__Stat NetworkStatus__Stat--Api ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>API:</div>
        <div className={'NetworkStatus__InfoValue'}>
          <Badge colorScheme={apiStatus ? 'green' : 'red'} className={'NetworkStatus__Badge'}>
            {ApiStatusIcon}
            {apiStatus ? 'operational' : 'disrupted'}
          </Badge>
        </div>
      </div>

      <div align={'start'} className={`NetworkStatus__Stat NetworkStatus__Stat--LatestBlock ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>Latest block:</div>
        <div className={'NetworkStatus__InfoValue'}>
          <Badge colorScheme={'gray'} className={'NetworkStatus__Badge'}>
            {status?.data?.api?.block?.height !== undefined
              ? <div className={'NetworkStatus__Value'}>
                  <Link href={`/block/${status?.data?.api?.block?.hash}`}>
                    #{status?.data?.api?.block?.height}
                    {status?.data?.api?.block?.timestamp && <>, <TimeDelta endDate={status?.data?.api?.block?.timestamp}/></>}
                  </Link>
                </div>
              : <div className={'NetworkStatus__Value'}>n/a</div>}
          </Badge>
        </div>
      </div>
    </div>
  )
}

export default NetworkStatus
