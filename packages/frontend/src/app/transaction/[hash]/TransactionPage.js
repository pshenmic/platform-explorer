'use client'

import * as Api from '../../../util/Api'
import { useState, useEffect, useCallback } from 'react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { CreditsBlock, InfoLine, DateBlock, Identifier } from '../../../components/data'
import TransactionData from './TransactionData'
import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { ValueContainer, PageDataContainer } from '../../../components/ui/containers'
import { ValueCard } from '../../../components/cards'
import { HorisontalSeparator } from '../../../components/ui/separators'
import { CopyButton } from '../../../components/ui/Buttons'
import { Badge } from '@chakra-ui/react'
import TypeBadge from '../../../components/transactions/TypeBadge'
import './TransactionPage.scss'

function Transaction ({ hash }) {
  const [transaction, setTransaction] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [decodedST, setDecodedST] = useState({ data: {}, loading: true, error: false })

  const decodeTx = useCallback((tx) => {
    Api.decodeTx(tx)
      .then(stateTransition => fetchHandlerSuccess(setDecodedST, stateTransition))
      .catch(err => fetchHandlerError(setDecodedST, err))
  }, [])

  const fetchData = () => {
    setTransaction(state => ({ ...state, loading: true }))

    Api.getTransaction(hash)
      .then((res) => {
        fetchHandlerSuccess(setTransaction, res)
        decodeTx(res.data)
      })
      .catch(err => fetchHandlerError(setTransaction, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [hash, decodeTx])

  const StatusIcon = transaction.data?.status === 'SUCCESS'
    ? <CheckCircleIcon color={'green.default'} mr={'5px'}/>
    : <WarningTwoIcon color={'red.default'} mr={'5px'}/>

  // temp
  // if (!transaction.data?.error) transaction.data.error = 'Document Ciifrnm8gjhAcRhySwtLhfwguGZ7cetssj3ETMSMX6j3 has invalid revision Some(1). The desired revision is 1'
  // if (!transaction.data?.owner) transaction.data.owner = '4qwHscUBwHeCJ1Q2KsMV8jpkkN68LfBxVPmCaKBKhzGK'
  // if (!transaction.data?.feeMultiplier) transaction.data.feeMultiplier = '10'
  // if (!transaction.data?.signature) transaction.data.signature = '19E4611A8CAF217C18BD978A5BE8D3EFA9C971C394BF8FE9C661AF86164DB517'

  return (
    <PageDataContainer
      className={'TransactionPage'}
      backLink={'/transactions'}
      title={'Transaction Info'}
    >
      <div className={'TransactionPage__CommonInfo'}>
        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--Timestamp'}
          title={'Timestamp'}
          value={(<DateBlock timestamp={transaction.data?.timestamp} showTime={true}/>)}
          loading={transaction.loading}
          error={transaction.error}
        />

        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Hash'}
          value={(
            <Identifier copyButton={true} ellipsis={false} styles={['highlight-both']}>
              {transaction.data?.hash}
            </Identifier>
          )}
          loading={transaction.loading}
          error={transaction.error}
        />

        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Block Hash'}
          value={(
            <ValueCard className={'TransactionPage__BlockHash'}>
              <ValueCard className={'TransactionPage__BlockHeight'}>Height: {transaction.data?.blockHeight}</ValueCard>
              <Identifier copyButton={true} ellipsis={false} styles={['highlight-both']}>
                {transaction.data?.blockHash}
              </Identifier>
            </ValueCard>
          )}
          loading={transaction.loading}
          error={transaction.error}
        />

        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--Index'}
          title={'Index'}
          value={transaction.data?.index}
          loading={transaction.loading}
          error={transaction.error}
        />

        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--Type'}
          title={'Type'}
          value={(<TypeBadge typeId={transaction.data?.type}/>)}
          loading={transaction.loading}
          error={transaction.error}
        />

        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--Status'}
          title={'Status'}
          value={(
            <div className={'TransactionPage__StatusContainer'}>
              <Badge
                className={'TransactionPage__StatusBadge'}
                lineHeight={'20px'}
                colorScheme={transaction.data?.status === 'SUCCESS' ? 'green' : 'red'}
              >
                {StatusIcon}
                {transaction.data?.status}
              </Badge>
              {transaction.data?.error &&
                <ValueContainer className={'TransactionPage__ErrorContainer'}>
                  {transaction.data.error}
                </ValueContainer>
              }
            </div>
          )}
          loading={transaction.loading}
          error={transaction.error}
        />

        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Owner'}
          value={(
            <ValueCard link={`/identity/${transaction.data?.owner?.identifier}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={false} styles={['highlight-both']}>
                {transaction.data?.owner?.identifier}
              </Identifier>
            </ValueCard>
          )}
          loading={transaction.loading}
          error={transaction.error}
        />

        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--RawTransaction'}
          title={'Raw Transaction'}
          value={(
            <ValueCard className={'TransactionPage__RawTransaction'}>
              {transaction.data?.data}
              <CopyButton text={transaction.data?.data}/>
            </ValueCard>
          )}
          loading={transaction.loading}
          error={transaction.error}
        />

        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--GasUsed'}
          title={'Gas Used'}
          value={(
            <CreditsBlock credits={transaction.data?.gasUsed} rate={rate}/>
          )}
          loading={transaction.loading}
          error={transaction.error}
        />

        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Fee Multiplier'}
          value={(
            <div>
              +{transaction.data?.feeMultiplier}%
            </div>
          )}
          loading={transaction.loading}
          error={transaction.error || !transaction.data?.feeMultiplier}
        />

        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Signature'}
          value={(
            <ValueCard className={'TransactionPage__Signature'}>
              {transaction.data?.signature}
            </ValueCard>
          )}
          loading={transaction.loading}
          error={transaction.error || !transaction.data?.signature}
        />
      </div>

      {!transaction.loading && !transaction.error &&
        <>
          <HorisontalSeparator/>
          <div className={'TransactionPage__DetailsInfo'}>
            <div className={'TransactionPage__DetailsInfoTitle'}>Details</div>
            <TransactionData data={decodedST.data} rate={rate} type={transaction.data?.type} loading={decodedST.loading}/>
          </div>
        </>
      }
    </PageDataContainer>
  )
}

export default Transaction
