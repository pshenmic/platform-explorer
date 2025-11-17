import { InfoLine, Identifier } from '@components/data'
import { ValueCard } from '@components/cards'
import { useEffect, useState } from 'react'
import * as Api from '@utils/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '@utils'
import { networks } from '../../../../constants/networks'
import { ValueContainer } from '@components/ui/containers'

import styles from './PayoutAddress.module.scss'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
const activeNetwork = networks.find(
  (network) => network.explorerBaseUrl === baseUrl
)
const l1explorerBaseUrl = activeNetwork?.l1explorerBaseUrl || null

export const PayoutAddress = ({ outputScript, loading, identity }) => {
  const [validator, setValidator] = useState({
    data: {},
    loading: true,
    error: false
  })

  useEffect(() => {
    const getData = () => {
      Api.getValidatorByMasternodeIdentity(identity)
        .then((res) => {
          fetchHandlerSuccess(setValidator, res)
        })
        .catch((err) => fetchHandlerError(setValidator, err))
    }

    if (!outputScript && !loading) {
      getData()
    }
  }, [outputScript, loading, identity])

  if (outputScript && !loading) {
    return (
      <InfoLine
        className={styles.root}
        title={'Output Script'}
        value={
          <ValueCard className={styles.card}>
            <Identifier
              copyButton={true}
              ellipsis={false}
            >
              {outputScript}
            </Identifier>
          </ValueCard>
        }
        loading={loading}
      />
    )
  }

  return (
    <InfoLine
      className={styles.root}
      title={'Payout address'}
      value={
        <a
          href={
            l1explorerBaseUrl
              ? `${l1explorerBaseUrl}/address/${validator.data?.proTxInfo?.state?.payoutAddress}`
              : '#'
          }
          target={'_blank'}
          rel={'noopener noreferrer'}
        >
          <ValueContainer
            className={styles.value}
            clickable={true}
            external={true}
          >
            <Identifier
              styles={['highlight-both']}
              ellipsis={false}
            >
              {validator.data?.proTxInfo?.state?.payoutAddress || ''}
            </Identifier>
          </ValueContainer>
        </a>
      }
      loading={validator.loading}
      error={
        validator.error || !validator.data?.proTxInfo?.state?.payoutAddress
      }
    />
  )
}
