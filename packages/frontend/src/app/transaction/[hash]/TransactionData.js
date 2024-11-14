import Link from 'next/link'
import { StateTransitionEnum } from '../../../enums/state.transition.type'
// import { Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import { ValueCard } from '../../../components/cards'
import { Identifier, InfoLine } from '../../../components/data'
import { TransactionCard } from '../../../components/transactions'

function TransactionData ({ data }) {
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
              {/*{data?.proTxHash}*/}
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
          <ValueCard link={`/identity/${data?.identity}`} className={'TransactionPage__BlockHash'}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.identity}
            </Identifier>
          </ValueCard>
        )}
        // loading={transaction.loading}
        error={!data?.identity}
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
      {/*<Thead>*/}
      {/*  <Tr>*/}
      {/*    <Th>Created data contract</Th>*/}
      {/*    <Th></Th>*/}
      {/*  </Tr>*/}
      {/*</Thead>*/}

      {/*<Tbody>*/}
      {/*  <Tr>*/}
      {/*    <Td>Data contract</Td>*/}
      {/*    <Td><Link href={`/dataContract/${data.dataContractId}`}>{data.dataContractId}</Link></Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Owner</Td>*/}
      {/*    <Td><Link href={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>*/}
      {/*  </Tr>*/}
      {/*</Tbody>*/}
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
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Transactions'}
        title={`Transitions ${data?.transitions !== undefined ? `(${data?.transitions.length})` : ''}`}
        value={(<>
          {data?.transitions?.map((transaction, i) => (
            <TransactionCard transaction={transaction} key={i}/>
          ))}
        </>)}
        // loading={transaction.loading}
        error={data?.transitions === undefined}
      />

      {/*<Thead>*/}
      {/*  <Tr>*/}
      {/*    <Th>Changed documents</Th>*/}
      {/*    <Th></Th>*/}
      {/*  </Tr>*/}
      {/*</Thead>*/}

      {/*{data.transitions.map((transition, key) =>*/}
      {/*  <Tbody className='TransactionData__DocumentsBatch' key={'dc' + key}>*/}
      {/*    <Tr>*/}
      {/*      <Td>Data contract</Td>*/}
      {/*      <Td><Link href={`/dataContract/${transition.dataContractId}`}>{transition.dataContractId}</Link></Td>*/}
      {/*    </Tr>*/}
      {/*    <Tr>*/}
      {/*      <Td>Document</Td>*/}
      {/*      <Td><Link href={`/document/${transition.id}`}>{transition.id}</Link></Td>*/}
      {/*    </Tr>*/}
      {/*  </Tbody>*/}
      {/*)}*/}
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
        // error={data?.identityId}
      />
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_TOP_UP) {
    return (<>
        {/*<Thead>*/}
        {/*  <Tr>*/}
        {/*    <Th>Credit top up</Th>*/}
        {/*    <Th></Th>*/}
        {/*  </Tr>*/}
        {/*</Thead>*/}

        {/*<Tbody>*/}
        {/*  <Tr>*/}
        {/*    <Td>Amount</Td>*/}
        {/*    <Td>{data.amount} Credits</Td>*/}
        {/*  </Tr>*/}
        {/*  <Tr>*/}
        {/*    <Td>Identity</Td>*/}
        {/*    <Td><Link href={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>*/}
        {/*  </Tr>*/}
        {/*</Tbody>*/}
    </>)
  }

  if (data.type === StateTransitionEnum.DATA_CONTRACT_UPDATE) {
    return (<>
      {/*<Thead>*/}
      {/*    <Tr>*/}
      {/*        <Th>Updated data contract</Th>*/}
      {/*        <Th></Th>*/}
      {/*    </Tr>*/}
      {/*</Thead>*/}

      {/*<Tbody>*/}
      {/*  <Tr>*/}
      {/*    <Td>Data contract</Td>*/}
      {/*    <Td><Link href={`/dataContract/${data.dataContractId}`}>{data.dataContractId}</Link></Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Owner</Td>*/}
      {/*    <Td><Link href={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Version</Td>*/}
      {/*    <Td>{data.version}</Td>*/}
      {/*  </Tr>*/}
      {/*</Tbody>*/}
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_UPDATE) {
    return (<>
      {/*<Thead>*/}
      {/*  <Tr>*/}
      {/*    <Th>Updated identity</Th>*/}
      {/*    <Th></Th>*/}
      {/*  </Tr>*/}
      {/*</Thead>*/}

      {/*<Tbody>*/}
      {/*  <Tr>*/}
      {/*    <Td>Identity</Td>*/}
      {/*    <Td><Link href={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Revision</Td>*/}
      {/*    <Td>{data.revision}</Td>*/}
      {/*  </Tr>*/}
      {/*</Tbody>*/}
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL) {
    return (<>
      {/*<Thead>*/}
      {/*  <Tr>*/}
      {/*    <Th>Credit withdrawal</Th>*/}
      {/*    <Th></Th>*/}
      {/*  </Tr>*/}
      {/*</Thead>*/}

      {/*<Tbody>*/}
      {/*  <Tr>*/}
      {/*    <Td>Identity</Td>*/}
      {/*    <Td><Link href={`/identity/${data.senderId}`}>{data.senderId}</Link></Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Output script</Td>*/}
      {/*    <Td>{data.outputScript}</Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Amount</Td>*/}
      {/*    <Td>{data.amount} Credits</Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Core fee per byte</Td>*/}
      {/*    <Td>{data.coreFeePerByte}</Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Nonce</Td>*/}
      {/*    <Td>{data.nonce}</Td>*/}
      {/*  </Tr>*/}
      {/*</Tbody>*/}
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_CREDIT_TRANSFER) {
    return (<>
      {/*<Thead>*/}
      {/*  <Tr>*/}
      {/*    <Th>Credit transfer</Th>*/}
      {/*    <Th></Th>*/}
      {/*  </Tr>*/}
      {/*</Thead>*/}

      {/*<Tbody>*/}
      {/*  <Tr>*/}
      {/*    <Td>Amount</Td>*/}
      {/*    <Td>{data.amount} Credits</Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Sender</Td>*/}
      {/*    <Td><Link href={`/identity/${data.senderId}`}>{data.senderId}</Link></Td>*/}
      {/*  </Tr>*/}
      {/*  <Tr>*/}
      {/*    <Td>Recipient</Td>*/}
      {/*    <Td><Link href={`/identity/${data.recipientId}`}>{data.recipientId}</Link></Td>*/}
      {/*  </Tr>*/}
      {/*</Tbody>*/}
    </>)
  }
}

export default TransactionData
