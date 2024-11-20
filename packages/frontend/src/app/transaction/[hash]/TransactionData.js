// import Link from 'next/link'
import { StateTransitionEnum } from '../../../enums/state.transition.type'
// import { Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import { ValueCard } from '../../../components/cards'
import { Identifier, InfoLine, CreditsBlock } from '../../../components/data'
import { TransitionCard } from '../../../components/transactions'

function TransactionData ({ data, rate }) {
  if (data === null) return <></>

  console.log('data', data)

  if (data.type === StateTransitionEnum.MASTERNODE_VOTE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Pro TX Hash'}
        value={(
          <ValueCard>
            <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
               {data?.proTxHash}
            </Identifier>
          </ValueCard>
        )}
        // loading={transaction.loading}
        // error={transaction.error}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Data Contract'}
        value={(
          <ValueCard link={`/dataContract/${data?.contractId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.contractId}
            </Identifier>
          </ValueCard>
        )}
        // loading={transaction.loading}
        error={!data?.contractId}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Voter Identity'}
        value={(
          <ValueCard link={`/identity/${data?.ownerId}`} className={'TransactionPage__BlockHash'}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.ownerId}
            </Identifier>
          </ValueCard>
        )}
        // loading={transaction.loading}
        error={!data?.ownerId}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Identity Nonce'}
        value={''}
        // loading={transaction.loading}
        error={true}
      />
    </>)
  }

  if (data.type === StateTransitionEnum.DATA_CONTRACT_CREATE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Data Contract'}
        value={(
          <ValueCard link={`/dataContract/${data?.dataContractId}`}>
            <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.dataContractId}
            </Identifier>
          </ValueCard>
        )}
        // loading={transaction.loading}
        error={!data?.dataContractId}
      />
    </>)
  }

  if (data.type === StateTransitionEnum.DOCUMENTS_BATCH) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Owner'}
        value={(
          <ValueCard link={`/identity/${data?.owner}`}>
            <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.owner}
            </Identifier>
          </ValueCard>
        )}
        // loading={transaction.loading}
        error={!data?.owner}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Transitions'}
        title={`Transitions ${data?.transitions !== undefined ? `(${data?.transitions.length})` : ''}`}
        value={(<>
          {data?.transitions?.map((transition, i) => (
            <TransitionCard className={'TransactionPage__TransitionCard'} transition={transition} key={i}/>
          ))}
        </>)}
        // loading={transaction.loading}
        error={data?.transitions === undefined}
      />
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_CREATE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Identity Address'}
        value={(
          <ValueCard link={`/identity/${data?.identityId}`}>
            <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.identityId}
            </Identifier>
          </ValueCard>
        )}
        // loading={transaction.loading}
        error={!data?.identityId}
      />
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_TOP_UP) {
    return (<>IDENTITY_TOP_UP</>)
  }

  if (data.type === StateTransitionEnum.DATA_CONTRACT_UPDATE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Data Contract'}
        value={(
          <ValueCard link={`/identity/${data?.dataContractId}`}>
            <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.dataContractId}
            </Identifier>
          </ValueCard>
        )}
        error={!data?.dataContractId}
      />

      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Version'}
        value={data?.version}
        error={data?.version === undefined}
      />
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_UPDATE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Revision'}
        value={data?.revision}
        error={data?.revision === undefined}
      />
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Amount'}
        value={<CreditsBlock credits={data?.amount} rate={rate}/>}
        error={data?.amount === undefined}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Identity Nonce'}
        value={data?.nonce}
        error={data?.nonce === undefined}
      />
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_CREDIT_TRANSFER) {
    return (<>IDENTITY_CREDIT_TRANSFER</>)
  }
}

export default TransactionData
