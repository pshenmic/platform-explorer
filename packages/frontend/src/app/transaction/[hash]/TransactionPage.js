'use client'

import * as Api from '../../../util/Api'
import { useState, useEffect, useCallback } from 'react'
// import { getTransitionTypeStringById, fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
// import { Credits, CreditsBlock, InfoLine, DateBlock, Identifier } from '../../../components/data'
import { CreditsBlock, InfoLine, DateBlock, Identifier } from '../../../components/data'
// import { LoadingLine, LoadingList } from '../../../components/loading'
// import { ErrorMessageBlock } from '../../../components/Errors'
// import TransactionData from './TransactionData'
import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons'
// import { RateTooltip } from '../../../components/ui/Tooltips'
import { ValueContainer, PageDataContainer } from '../../../components/ui/containers'
import { ValueCard } from '../../../components/cards'
import { HorisontalSeparator } from '../../../components/ui/separators'
import { CopyButton } from '../../../components/ui/Buttons'
import {
  // Container,
  // TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  // Heading,
  // Flex,
  // Code,
  Badge
} from '@chakra-ui/react'
import TypeBadge from '../../../components/transactions/TypeBadge'
import './TransactionPage.scss'

function Transaction ({ hash }) {
  const [transaction, setTransaction] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [decodedST, setDecodedST] = useState(null)
  // const tdTitleWidth = 250

  console.log('transaction', transaction)
  console.log('decodedST', decodedST)

  const decodeTx = useCallback((tx) => {
    Api.decodeTx(tx)
      .then((stateTransition) => {
        setDecodedST(stateTransition)
      })
      .catch(console.log)
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
  if (!transaction.data?.error) transaction.data.error = 'Document Ciifrnm8gjhAcRhySwtLhfwguGZ7cetssj3ETMSMX6j3 has invalid revision Some(1). The desired revision is 1'
  if (!transaction.data?.owner) transaction.data.owner = 'OWnErBelIBErDa1F8NJ16BV7MBgMK4b26RUSesSS31Ec'
  if (!transaction.data?.feeMultiplier) transaction.data.feeMultiplier = '10'
  if (!transaction.data?.signature) transaction.data.signature = '19E4611A8CAF217C18BD978A5BE8D3EFA9C971C394BF8FE9C661AF86164DB517'

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
            <ValueCard>
              <Identifier avatar={true} copyButton={true} ellipsis={false} styles={['highlight-both']}>
                {transaction.data?.owner}
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

      <HorisontalSeparator/>

      <div className={'TransactionPage__DetailsInfo'}>
        Details
      </div>

    </PageDataContainer>
  )

// return (
//   <Container
//     maxW={'container.lg'}
//       p={3}
//       mt={8}
//     >
//         <TableContainer
//           maxW={'none'}
//           borderWidth={'1px'} borderRadius={'block'}
//           mb={4}
//         >
//             {!transaction.error
//               ? <Table variant='simple' className='Table'>
//                 <Thead>
//                   <Tr>
//                     <Th>transaction info</Th>
//                     <Th></Th>
//                   </Tr>
//                 </Thead>
//                 <Tbody>
//                   <Tr>
//                     <Td w={tdTitleWidth}>Status</Td>
//                     <Td>
//                       <LoadingLine loading={transaction.loading}>
//                         <Flex alignItems={'center'}>{transaction.data?.status}{StatusIcon}</Flex>
//                       </LoadingLine>
//                     </Td>
//                   </Tr>
//                   {transaction.data?.error &&
//                     <Tr>
//                       <Td w={tdTitleWidth}>Error</Td>
//                       <Td>
//                         <LoadingLine loading={transaction.loading}>
//                           <Code whiteSpace={'wrap'} mt={2} maxW={['300px', '300px', '500px', '720px']}>
//                             {transaction.data?.error}
//                           </Code>
//                         </LoadingLine>
//                       </Td>
//                     </Tr>
//                   }
//                   <Tr>
//                     <Td w={tdTitleWidth}>Hash</Td>
//                     <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
//                       <LoadingLine loading={transaction.loading}>{transaction.data?.hash}</LoadingLine>
//                     </Td>
//                   </Tr>
//                   <Tr>
//                     <Td w={tdTitleWidth}>Height</Td>
//                     <Td>
//                       <LoadingLine loading={transaction.loading}>{transaction.data?.blockHeight}</LoadingLine>
//                     </Td>
//                   </Tr>
//                   <Tr>
//                     <Td w={tdTitleWidth}>Type</Td>
//                     <Td>
//                       <LoadingLine loading={transaction.loading}>
//                         {transaction.data?.type && getTransitionTypeStringById(transaction.data?.type)}
//                       </LoadingLine>
//                     </Td>
//                   </Tr>
//                   <Tr>
//                     <Td w={tdTitleWidth}>Index</Td>
//                     <Td>
//                       <LoadingLine loading={transaction.loading}>{transaction.data?.index}</LoadingLine>
//                     </Td>
//                   </Tr>
//                   <Tr>
//                     <Td w={tdTitleWidth}>Timestamp</Td>
//                     <Td>
//                       <LoadingLine loading={transaction.loading}>{transaction.data?.timestamp && new Date(transaction.data?.timestamp).toLocaleString()}</LoadingLine>
//                     </Td>
//                   </Tr>
//                   <Tr>
//                     <Td w={tdTitleWidth}>Gas Used</Td>
//                     <Td>
//                       <LoadingLine loading={transaction.loading}>
//                         <RateTooltip
//                           credits={transaction.data?.gasUsed}
//                           rate={rate.data}
//                         >
//                           <span><Credits>{transaction.data?.gasUsed}</Credits> Credits</span>
//                         </RateTooltip>
//                       </LoadingLine>
//                     </Td>
//                   </Tr>
//                 </Tbody>
//                 </Table>
//               : <Container h={20}><ErrorMessageBlock/></Container>}
//         </TableContainer>
//
//         {!transaction.error &&
//           <Container
//             maxW={'container.lg'}
//             m={0}
//             className={'InfoBlock'}
//           >
//             <Heading className={'InfoBlock__Title'} as={'h1'}>Transaction data</Heading>
//
//             {(!transaction.loading && decodedST)
//               ? <Table variant='simple' className='Table TransactionData'>
//                   <TransactionData data={decodedST}/>
//                 </Table>
//               : <LoadingList itemsCount={3}/>}
//           </Container>
//         }
//     </Container>
//   )
}

export default Transaction
