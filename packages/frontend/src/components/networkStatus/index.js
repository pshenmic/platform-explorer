'use client'

import * as Api from '../../util/Api'
import { useState, useEffect, useCallback } from 'react'
import { InfoIcon, CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Container, Tooltip, Flex } from '@chakra-ui/react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import Link from 'next/link'
import './NetworkStatus.scss'

function NetworkStatus () {
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
    ? <CheckCircleIcon color={'green.500'} ml={2}/>
    : <WarningTwoIcon color={'yellow.400'} ml={2}/>

  const ApiStatusIcon = apiStatus
    ? <CheckCircleIcon color={'green.500'} ml={2}/>
    : <WarningTwoIcon color={'yellow.400'} ml={2}/>

  function getLastBlocktimeString () {
    if (!status?.data?.api?.block?.timestamp) return 'n/a'

    const diff = new Date() - new Date(status?.data?.api?.block?.timestamp)

    if (diff < 60 * 1000) {
      return `${Math.floor((diff / 1000))} sec. ago`
    } else {
      return `${Math.floor((diff / 1000) / 60)} min. ago`
    }
  }

  return (
        <Container
            className={'NetworkStatus'}
            maxW={'100%'}
            m={0}
            p={6}
            pl={6}
            h={'100%'}
            borderWidth={'1px'} borderRadius={'lg'}
        >
            <div className={`NetworkStatus__InfoItem ${status?.loading ? 'NetworkStatus__InfoItem--Loading' : ''}`}>
                <div className={'NetworkStatus__Title'}>Epoch:</div>
                <div className={'NetworkStatus__Value'}>
                    <span>{status?.data?.epoch?.index ? `#${status.data.epoch.index}` : '-'}</span>

                    {status?.data?.epoch?.endTime &&
                        <Tooltip
                            label={`Next epoch change at ${new Date(status.data.epoch.endTime).toLocaleString()}`}
                            aria-label={'A tooltip'}
                            placement={'top'}
                            hasArrow
                            bg={'gray.700'}
                            color={'white'}
                        >
                            <InfoIcon boxSize={4} color={'gray.600'} ml={2}/>
                        </Tooltip>
                    }
                </div>
            </div>

            <div className={`NetworkStatus__InfoItem ${status?.loading ? 'NetworkStatus__InfoItem--Loading' : ''}`}>
                <div className={'NetworkStatus__Title'}>Platform version:</div>
                <div className={'NetworkStatus__Value'}>
                    <span>{status?.data?.platform?.version !== undefined ? `v${status.data.platform.version}` : '-'}</span>
                </div>
            </div>

            <div className={`NetworkStatus__InfoItem ${status?.loading ? 'NetworkStatus__InfoItem--Loading' : ''}`}>
                <div className={'NetworkStatus__Title'}>Tenderdash version:</div>
                <div className={'NetworkStatus__Value'}>
                    <span>{status?.data?.tenderdash?.version ? `v${status.data.tenderdash.version}` : '-'}</span>
                </div>
            </div>

            <div className={`NetworkStatus__InfoItem ${status?.loading ? 'NetworkStatus__InfoItem--Loading' : ''}`}>
                <Flex mr={6}>
                  <div className={'NetworkStatus__Title'}>Network:</div>
                  <div className={'NetworkStatus__Value'}>
                      <span>{status?.data?.network ? `${status.data.network}` : 'n/a'}</span>

                      <Tooltip
                          label={`${networkStatus
                              ? 'Network appears operational'
                              : 'Chain propagation degraded'
                          }`}
                          aria-label={'Network status'}
                          placement={'top'}
                          hasArrow
                          bg={'gray.700'}
                          color={'white'}
                      >
                          {NetworkStatusIcon}
                      </Tooltip>
                  </div>
                </Flex>
                <Flex>
                  <div className={'NetworkStatus__Title NetworkStatus__Title--Api'}>API:</div>
                  <div className={'NetworkStatus__Value'}>
                      <Tooltip
                          label={`${apiStatus
                              ? 'API appears operational'
                              : 'API indexing disrupted'
                          }`}
                          aria-label={'API status'}
                          placement={'top'}
                          hasArrow
                          bg={'gray.700'}
                          color={'white'}
                      >
                          {ApiStatusIcon}
                      </Tooltip>
                  </div>
                </Flex>
            </div>

            <div className={`NetworkStatus__InfoItem ${status?.loading ? 'NetworkStatus__InfoItem--Loading' : ''}`}>
                <div className={'NetworkStatus__Title'}>Latest block:</div>

                {status?.data?.api?.block?.height !== undefined
                  ? <div className={'NetworkStatus__Value'}>
                        <Link href={`/block/${status?.data?.api?.block?.hash}`}>
                            #{status?.data?.api?.block?.height}, {getLastBlocktimeString()}
                        </Link>
                    </div>
                  : <div className={'NetworkStatus__Value'}>n/a</div>}
            </div>
        </Container>
  )
}

export default NetworkStatus
