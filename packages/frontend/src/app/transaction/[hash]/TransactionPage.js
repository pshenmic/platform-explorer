'use client'

import * as Api from '../../../util/Api'
import { useState, useEffect, useCallback } from 'react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { CreditsBlock, InfoLine, DateBlock, Identifier } from '../../../components/data'
import TransactionData from './TransactionData'
import { ValueContainer, PageDataContainer } from '../../../components/ui/containers'
import { ValueCard } from '../../../components/cards'
import { HorisontalSeparator } from '../../../components/ui/separators'
import { CopyButton } from '../../../components/ui/Buttons'
import { TypeBadge, FeeMultiplier, TransactionStatusBadge } from '../../../components/transactions'
import { ErrorMessageBlock } from '../../../components/Errors'
import { networks } from '../../../constants/networks'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import './TransactionPage.scss'

function Transaction ({ hash }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [transaction, setTransaction] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [decodedST, setDecodedST] = useState({ data: {}, loading: true, error: false })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const activeNetwork = networks.find(network => network.explorerBaseUrl === baseUrl)
  const l1explorerBaseUrl = activeNetwork?.l1explorerBaseUrl || null

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Transactions', path: '/transactions' },
      { label: hash }
    ])
  }, [setBreadcrumbs, hash])

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

  return (
    <PageDataContainer
      className={'TransactionPage'}
      title={'Transaction Info'}
    >
      {transaction.error && <ErrorMessageBlock h={'450px'}/>}

      {!transaction.error &&
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
              <ValueCard link={`/block/${transaction.data?.blockHash}`} className={'TransactionPage__BlockHash'}>
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
            value={<TypeBadge type={transaction.data?.type}/>}
            loading={transaction.loading}
            error={transaction.error}
          />

          <InfoLine
            className={'TransactionPage__InfoLine TransactionPage__InfoLine--Status'}
            title={'Status'}
            value={(
              <div className={'TransactionPage__StatusContainer'}>
                <TransactionStatusBadge status={transaction.data?.status} />
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
            className={'TransactionPage__InfoLine TransactionPage__InfoLine--Owner'}
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
            className={'TransactionPage__InfoLine TransactionPage__InfoLine--FeeMultiplier'}
            title={'Fee Multiplier'}
            value={<FeeMultiplier value={Number(decodedST.data?.userFeeIncrease)}/>}
            loading={decodedST.loading}
            error={decodedST.error || (!decodedST.loading && decodedST.data?.userFeeIncrease === undefined)}
          />

          <InfoLine
            className={'TransactionPage__InfoLine'}
            title={'Signature'}
            value={(
              <ValueCard className={'TransactionPage__Signature'}>
                {decodedST.data?.signature}
                <CopyButton text={decodedST.data?.signature}/>
              </ValueCard>
            )}
            loading={decodedST.loading}
            error={decodedST.error || (!decodedST.loading && !decodedST.data?.signature)}
          />
        </div>
      }

      {(decodedST.data?.outputAddress ||
        decodedST.data?.fundingAddress) &&
        <>
          <HorisontalSeparator/>

          {decodedST.data?.coreFeePerByte &&
            <InfoLine
              className={'TransactionPage__InfoLine TransactionPage__InfoLine--CoreFeePerByte'}
              title={'Core Fee Per Byte'}
              value={<>{decodedST.data?.coreFeePerByte} Duff</>}
              loading={decodedST.loading}
            />
          }

          {decodedST.data?.outputAddress &&
            <InfoLine
              className={'TransactionPage__InfoLine TransactionPage__InfoLine--CoreWithdrawalAddress'}
              title={'Core Withdrawal Address'}
              value={(
                <a
                  href={l1explorerBaseUrl
                    ? `${l1explorerBaseUrl}/address/${decodedST.data?.outputAddress}`
                    : '#'}
                  target={'_blank'}
                  rel={'noopener noreferrer'}
                >
                  <ValueContainer clickable={true} external={true}>
                    <Identifier copyButton={true} ellipsis={false} styles={['highlight-both']}>
                      {decodedST.data?.outputAddress}
                    </Identifier>
                  </ValueContainer>
                </a>
              )}
              loading={decodedST.loading}
            />
          }
        </>
      }

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
