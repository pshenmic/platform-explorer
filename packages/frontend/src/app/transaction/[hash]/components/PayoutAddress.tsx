import { InfoLine, Identifier } from '@components/data'
import { ValueCard } from '@components/cards'
import { useEffect, useState } from 'react'
import * as Api from '@utils/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '@utils'
import { ValueContainer } from '@components/ui/containers'
import { useActiveNetwork } from 'src/contexts'
import type { Validator } from '../../../../types'
import type { LoadableState } from '../../../../types/common'

import styles from './PayoutAddress.module.scss'

interface PayoutAddressProps {
  outputScript?: string | null
  loading?: boolean
  identity?: string | null
}

export const PayoutAddress = ({ outputScript, loading, identity }: PayoutAddressProps) => {
  const { l1explorerBaseUrl } = useActiveNetwork()

  const [validator, setValidator] = useState<LoadableState<Validator>>({
    data: null,
    loading: true,
    error: false
  })

  useEffect(() => {
    const getData = (): void => {
      if (!identity) return
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

  const payoutAddress = (validator.data?.proTxInfo?.state as { payoutAddress?: string } | null | undefined)
    ?.payoutAddress

  return (
    <InfoLine
      className={styles.root}
      title={'Payout address'}
      value={
        <a
          href={
            l1explorerBaseUrl
              ? `${l1explorerBaseUrl}/address/${payoutAddress}`
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
              {payoutAddress || ''}
            </Identifier>
          </ValueContainer>
        </a>
      }
      loading={validator.loading}
      error={validator.error || !payoutAddress}
    />
  )
}
