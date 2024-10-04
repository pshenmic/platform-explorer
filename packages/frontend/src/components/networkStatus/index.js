'use client'

import * as Api from '../../util/Api'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'
import EpochProgress from './EpochProgress'
import { Badge } from '@chakra-ui/react'
import { fetchHandlerSuccess, fetchHandlerError, getTimeDelta } from '../../util'
import { Tooltip } from '../ui/Tooltips'
import Link from 'next/link'
import './NetworkStatus.scss'

function NetworkStatus ({ className }) {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })

  const fetchData = useCallback(() => {
    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))
      .finally(() => setTimeout(fetchData, 60000))
  }, [])

  useEffect(fetchData, [fetchData])

  const msFromLastBlock = new Date() - new Date(status?.data?.tenderdash?.block?.timestamp)
  const networkStatus = msFromLastBlock && msFromLastBlock / 1000 / 60 < 15
  const apiStatus = typeof status?.data?.tenderdash?.block?.timestamp === 'string' &&
    new Date(status?.data?.api?.block?.timestamp).getTime() ===
    new Date(status?.data?.tenderdash?.block?.timestamp).getTime()

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
            ? <>#{status.data.epoch.number}
                {status.data?.epoch?.endTime &&
                  <Tooltip
                    label={`Next epoch change at ${new Date(status.data.epoch.endTime).toLocaleString()}`}
                    aria-label={'A tooltip'}
                    placement={'top'}
                    bg={'gray.700'}
                    color={'white'}
                  >
                    <InfoIcon ml={2} color={'brand.light'} boxSize={4}/>
                  </Tooltip>
                }
              </>
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
        <div className={'NetworkStatus__InfoValue'}>{status?.data?.platform?.version !== undefined ? `v${status.data.platform.version}` : '-'}</div>
      </div>

      <div className={`NetworkStatus__Stat NetworkStatus__Stat--TenderdashVersion ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>Tenderdash version:</div>
        <div className={'NetworkStatus__InfoValue'}>{status?.data?.tenderdash?.version ? `v${status.data.tenderdash.version}` : '-'}</div>
      </div>

      <div align={'start'} className={`NetworkStatus__Stat NetworkStatus__Stat--Network ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>Network:</div>
        <div className={'NetworkStatus__InfoValue'}>
          <Badge lineHeight={'20px'} colorScheme={networkStatus ? 'green' : 'red'} className={'NetworkStatus__Badge'}>
            {NetworkStatusIcon}
            {status?.data?.network ? `${status.data.network}` : 'n/a'}
          </Badge>
        </div>
      </div>

      <div align={'start'} className={`NetworkStatus__Stat NetworkStatus__Stat--Api ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>API:</div>
        <div className={'NetworkStatus__InfoValue'}>
          <Badge lineHeight={'20px'} colorScheme={apiStatus ? 'green' : 'red'} className={'NetworkStatus__Badge'}>
            {ApiStatusIcon}
            {apiStatus ? 'operational' : 'disrupted'}
          </Badge>
        </div>
      </div>

      <div align={'start'} className={`NetworkStatus__Stat NetworkStatus__Stat--LatestBlock ${status?.loading ? 'NetworkStatus__Stat--Loading' : ''}`}>
        <div className={'NetworkStatus__InfoTitle'}>Latest block:</div>
        <div className={'NetworkStatus__InfoValue'}>
          <Badge lineHeight={'20px'} colorScheme={'gray'} className={'NetworkStatus__Badge'}>
            {status?.data?.api?.block?.height !== undefined
              ? <div className={'NetworkStatus__Value'}>
                  <Link href={`/block/${status?.data?.api?.block?.hash}`}>
                    #{status?.data?.api?.block?.height},
                    {status?.data?.api?.block?.timestamp && ' ' + getTimeDelta(new Date(), new Date(status.data.api.block?.timestamp))}
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
