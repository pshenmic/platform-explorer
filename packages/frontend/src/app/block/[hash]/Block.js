'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
// import {LoadingBlock, LoadingLine} from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
// import { fetchHandlerSuccess, fetchHandlerError, paginationHandler } from '../../../util'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
// import {DocumentsRevisionsList, DocumentTotalCard} from '../../../components/documents'
import {
  Container,
  // TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  // Heading, Tabs, TabList, Tab, TabPanels, TabPanel
  Tabs, TabList, Tab, TabPanels, TabPanel
} from '@chakra-ui/react'
import { BlockDigestCard, BlockTotalCard, QuorumMembersList } from '../../../components/blocks'
// import {CodeBlock} from "../../../components/data";
import './Block.scss'

function Block ({ hash }) {
  const [block, setBlock] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [transactions] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  // const tdTitleWidth = 250

  const fetchData = () => {
    setBlock(state => ({ ...state, loading: true }))

    Api.getBlockByHash(hash)
      .then(res => fetchHandlerSuccess(setBlock, res))
      .catch(err => fetchHandlerError(setBlock, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [hash])

  return (
    <PageDataContainer
      className={'Block'}
      title={'Block info'}
    >
      <div className={'Block__InfoBlocks'}>
        <BlockTotalCard className={'Block__InfoBlock'} block={block}/>
        <BlockDigestCard className={'Block__InfoBlock'} block={block} rate={rate}/>
      </div>

      <InfoContainer styles={['tabs']}>
        <Tabs index={1}>
          <TabList>
            <Tab>Transactions {block.data?.txs?.length !== undefined
              ? <span
                className={`Tabs__TabItemsCount ${block.data?.txs?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {block.data?.txs?.length}
                </span>
              : ''}
            </Tab>
            <Tab>Quorum Members {block?.data?.quorum?.members?.length !== undefined
              ? <span
                className={`Tabs__TabItemsCount ${block?.data?.quorum?.members?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {block?.data?.quorum?.members?.length}
                </span>
              : ''}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel position={'relative'}>
              {!transactions.error
                ? <TransactionsList
                  transactions={block.data?.txs}
                  rate={rate.data}
                  // pagination={{
                  //   onPageChange: pagination => paginationHandler(setRevisions, pagination.selected),
                  //   pageCount: Math.ceil(transactions.data?.pagination?.total / pageSize) || 1,
                  //   forcePage: transactions.props.currentPage
                  // }}
                />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              <QuorumMembersList members={block?.data?.quorum?.members}/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default Block

// <Container
// maxW={'container.xl'}
// color={'white'}
//   >
//   <TableContainer
// maxW={'none'}
// borderWidth={'1px'}
// borderRadius={'block'}
//   >
//   {!block.error
//   ? <Table variant={'simple'}>
//     <Thead>
//       <Tr>
//         <Th><div className={'Table__Title'}>Block info</div></Th>
//         <Th></Th>
//       </Tr>
//     </Thead>
//     <Tbody>
//       <Tr>
//         <Td w={tdTitleWidth}>Hash</Td>
//         <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
//           <LoadingLine loading={block.loading}>
//             {block.data?.header?.hash}
//           </LoadingLine>
//         </Td>
//       </Tr>
//       <Tr>
//         <Td w={tdTitleWidth}>Height</Td>
//         <Td>
//           <LoadingLine loading={block.loading}>{block.data?.header?.height}</LoadingLine>
//         </Td>
//       </Tr>
//       <Tr>
//         <Td w={tdTitleWidth}>Timestamp</Td>
//         <Td>
//           <LoadingLine loading={block.loading}>{new Date(block.data?.header?.timestamp).toLocaleString()}</LoadingLine>
//         </Td>
//       </Tr>
//       <Tr>
//         <Td w={tdTitleWidth}>Block Version</Td>
//         <Td>
//           <LoadingLine loading={block.loading}>{block.data?.header?.blockVersion}</LoadingLine>
//         </Td>
//       </Tr>
//       <Tr>
//         <Td w={tdTitleWidth}>App Version</Td>
//         <Td>
//           <LoadingLine loading={block.loading}>{block.data?.header?.appVersion}</LoadingLine>
//         </Td>
//       </Tr>
//       <Tr>
//         <Td w={tdTitleWidth}>L1 Locked Height</Td>
//         <Td>
//           <LoadingLine loading={block.loading}>{block.data?.header?.l1LockedHeight}</LoadingLine>
//         </Td>
//       </Tr>
//       <Tr>
//         <Td w={tdTitleWidth}>Transactions count</Td>
//         <Td>
//           <LoadingLine loading={block.loading}>{block.data?.txs?.length}</LoadingLine>
//         </Td>
//       </Tr>
//       <Tr>
//         <Td w={tdTitleWidth}>Validator</Td>
//         <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
//           <LoadingLine loading={block.loading}>
//             {block.data?.header?.validator}
//           </LoadingLine>
//         </Td>
//       </Tr>
//     </Tbody>
//   </Table>
//   : <Container h={20}><ErrorMessageBlock/></Container>}
// </TableContainer>
// </Container>

// {block.data?.txs?.length
//   ? <Container
//     width={'100%'}
//     maxW={'none'}
//     mt={5}
//     className={'InfoBlock'}
//   >
//     <Heading className={'InfoBlock__Title'} as={'h1'}>Transactions</Heading>
//     <TransactionsList
//       transactions={block.data?.txs} rate={rate.data}
//       // pagination={{
//       //   onPageChange: pagination => paginationHandler(setRevisions, pagination.selected),
//       //   pageCount: Math.ceil(transactions.data?.pagination?.total / pageSize) || 1,
//       //   forcePage: transactions.props.currentPage
//       // }}
//     />
//   </Container>
//   : null}
