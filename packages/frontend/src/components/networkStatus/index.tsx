'use client'

import * as Api from '../../util/Api'
import { useState, useEffect, useCallback } from 'react'
import type { ComponentType } from 'react'
import { CheckmarkIcon, ErrorCircleIcon, InfoIcon } from '../ui/icons'
import EpochProgress from './EpochProgress'
import { Badge } from '../ui/Badge'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { TimeDelta as TimeDeltaJs } from '../data'
import { EpochTooltip } from '../ui/Tooltips'
import Link from 'next/link'
import type { LoadableState, WithClassName } from '../../types/common'
import type { Status } from '../../types'
import './NetworkStatus.css'

// Untyped JS component — props optional until data/* is migrated
const TimeDelta = TimeDeltaJs as ComponentType<{
  endDate?: string | number | Date | null
  startDate?: string | number | Date | null
  showTimestampTooltip?: boolean
  tooltipDate?: string | number | Date | null
  format?: string
}>

function checkApiStatus(status: LoadableState<Status>): boolean {
  if (!status?.data?.tenderdash?.block?.timestamp || !status?.data?.api?.block?.timestamp)
    return false

  const tenderdashTimestamp = new Date(status.data.tenderdash.block.timestamp).getTime()
  const apiTimestamp = new Date(status.data.api.block.timestamp).getTime()

  return (
    !Number.isNaN(apiTimestamp) &&
    !Number.isNaN(tenderdashTimestamp) &&
    Math.abs(apiTimestamp - tenderdashTimestamp) <= 10 * 60 * 1000
  )
}

function NetworkStatus({ className }: WithClassName) {
  const [status, setStatus] = useState<LoadableState<Status>>({
    data: null,
    loading: true,
    error: false
  })
  const lastBlockTimestamp = status?.data?.tenderdash?.block?.timestamp
  const msFromLastBlock = lastBlockTimestamp
    ? Date.now() - new Date(lastBlockTimestamp).getTime()
    : null
  const networkStatus = msFromLastBlock !== null && msFromLastBlock / 1000 / 60 < 15
  const apiStatus = checkApiStatus(status)

  const fetchData = useCallback(() => {
    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))
      .finally(() => setTimeout(fetchData, 15000))
  }, [])

  useEffect(fetchData, [fetchData])

  const NetworkStatusIcon = networkStatus ? <CheckmarkIcon mr={2} /> : <ErrorCircleIcon mr={2} />

  const ApiStatusIcon = apiStatus ? <CheckmarkIcon mr={2} /> : <ErrorCircleIcon mr={2} />

  return (
    <div className={`NetworkStatus  ${className || ''}`}>
      <div
        className={`NetworkStatus__Stat NetworkStatus__Stat--Epoch ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}
      >
        <div className={'NetworkStatus__InfoTitle'}>Epoch:</div>
        <div className={'NetworkStatus__InfoValue NetworkStatus__InfoValue--Epoch'}>
          {typeof status?.data?.epoch?.number === 'number' ? (
            <EpochTooltip epoch={status.data.epoch}>
              <span>
                #{status.data.epoch.number}
                <InfoIcon ml={2} color={'brand.light'} boxSize={4} />
              </span>
            </EpochTooltip>
          ) : (
            'n/a'
          )}
          {status.data?.epoch && (
            <div className={'NetworkStatus__EpochProgress'}>
              <EpochProgress epoch={status.data.epoch} />
            </div>
          )}
        </div>
      </div>

      <div
        className={`NetworkStatus__Stat NetworkStatus__Stat--PlatformVersion ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}
      >
        <div className={'NetworkStatus__InfoTitle'}>Platform version:</div>
        <div className={'NetworkStatus__InfoValue'}>
          {status?.data?.versions?.software?.drive !== undefined &&
          status?.data?.versions?.software?.drive !== null
            ? `v${status?.data?.versions?.software?.drive}`
            : '-'}
        </div>
      </div>

      <div
        className={`NetworkStatus__Stat NetworkStatus__Stat--TenderdashVersion ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}
      >
        <div className={'NetworkStatus__InfoTitle'}>Tenderdash version:</div>
        <div className={'NetworkStatus__InfoValue'}>
          {status?.data?.versions?.software?.tenderdash
            ? `v${status?.data?.versions?.software?.tenderdash}`
            : '-'}
        </div>
      </div>

      <div
        className={`NetworkStatus__Stat NetworkStatus__Stat--Network ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}
      >
        <div className={'NetworkStatus__InfoTitle'}>Network:</div>
        <div className={'NetworkStatus__InfoValue'}>
          <Badge colorScheme={networkStatus ? 'green' : 'red'} className={'NetworkStatus__Badge'}>
            {NetworkStatusIcon}
            {status?.data?.network ? `${status.data.network}` : 'n/a'}
          </Badge>
        </div>
      </div>

      <div
        className={`NetworkStatus__Stat NetworkStatus__Stat--Api ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}
      >
        <div className={'NetworkStatus__InfoTitle'}>API:</div>
        <div className={'NetworkStatus__InfoValue'}>
          <Badge colorScheme={apiStatus ? 'green' : 'red'} className={'NetworkStatus__Badge'}>
            {ApiStatusIcon}
            {apiStatus ? 'operational' : 'disrupted'}
          </Badge>
        </div>
      </div>

      <div
        className={`NetworkStatus__Stat NetworkStatus__Stat--LatestBlock ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}
      >
        <div className={'NetworkStatus__InfoTitle'}>Latest block:</div>
        <div className={'NetworkStatus__InfoValue'}>
          <Badge colorScheme={'gray'} className={'NetworkStatus__Badge'}>
            {status?.data?.api?.block?.height !== undefined &&
            status?.data?.api?.block?.height !== null ? (
              <div className={'NetworkStatus__Value'}>
                <Link href={`/block/${status?.data?.api?.block?.hash}`}>
                  #{status?.data?.api?.block?.height}
                  {status?.data?.api?.block?.timestamp && (
                    <>
                      , <TimeDelta endDate={status?.data?.api?.block?.timestamp} />
                    </>
                  )}
                </Link>
              </div>
            ) : (
              <div className={'NetworkStatus__Value'}>n/a</div>
            )}
          </Badge>
        </div>
      </div>
    </div>
  )
}

export default NetworkStatus
