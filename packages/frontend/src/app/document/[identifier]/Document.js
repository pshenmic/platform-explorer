'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, paginationHandler, setLoadingProp } from '../../../util'
import { ErrorMessageBlock } from '../../../components/Errors'
import { useSearchParams } from 'next/navigation'
import { Container, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { DocumentTotalCard, DocumentsRevisionsList } from '../../../components/documents'
import { LoadingBlock } from '../../../components/loading'
import { CodeBlock } from '../../../components/data'
import './Document.scss'

const pagintationConfig = {
  itemsOnPage: {
    default: 10,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Document ({ identifier }) {
  const [document, setDocument] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [revisions, setRevisions] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const searchParams = useSearchParams()
  const DocumentId = searchParams.get('contract-id') || null
  const typeName = searchParams.get('document-type-name') || null
  const pageSize = pagintationConfig.itemsOnPage.default

  const fetchData = () => {
    setDocument(state => ({ ...state, loading: true }))

    Api.getDocumentByIdentifier(identifier, DocumentId, typeName)
      .then(document => fetchHandlerSuccess(setDocument, document))
      .catch(err => fetchHandlerError(setDocument, err))
  }

  console.log('document', document)
  console.log('revisions', revisions)

  useEffect(fetchData, [identifier])

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setRevisions)

    Api.getDocumentRevisions(identifier, revisions.props.currentPage + 1, pageSize, 'desc')
      .then(paginatedDataContracts => fetchHandlerSuccess(setRevisions, paginatedDataContracts))
      .catch(err => fetchHandlerError(setRevisions, err))
  }, [identifier, revisions.props.currentPage])

  return (
    <PageDataContainer
      className={'Document'}
      title={'Document info'}
    >
      <div className={'Document__InfoBlocks'}>
        <DocumentTotalCard className={'Document__InfoBlock'} document={document}/>

        <div className={'Document__InfoBlock Document__Data'}>
          <div className={'Document__DataTitle'}>Data</div>
          {!document.error
            ? <LoadingBlock h={'100%'} loading={document.loading}>
                {document.data?.data
                  ? <CodeBlock className={'DataContract__DataBlock'} code={document.data?.data}/>
                  : <Container h={20}><ErrorMessageBlock/></Container>}
              </LoadingBlock>
            : <Container h={20}><ErrorMessageBlock/></Container>
          }
        </div>
      </div>

      <InfoContainer styles={['tabs']}>
        <Tabs>
          <TabList>
            <Tab>Revision {revisions.data?.pagination?.total !== undefined
              ? <span className={`Tabs__TabItemsCount ${revisions.data?.pagination?.total === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {revisions.data?.pagination?.total}
                </span>
              : ''}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel position={'relative'}>
              {!revisions.error
                ? <DocumentsRevisionsList
                    revisions={revisions.data?.resultSet}
                    loading={revisions.loading}
                    pagination={{
                      onPageChange: pagination => paginationHandler(setRevisions, pagination.selected),
                      pageCount: Math.ceil(revisions.data?.pagination?.total / pageSize) || 1,
                      forcePage: revisions.props.currentPage
                    }}
                  />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )

  // return (
  //   <Container
  //       maxW={'container.xl'}
  //       bg={'gray.600'}
  //       color={'white'}
  //       _dark={{ bg: 'gray.900' }}
  //       mt={8}
  //       mb={8}
  //       className={'DocumentPage'}
  //   >
  //       <Flex
  //           w={'100%'}
  //           justifyContent={'space-between'}
  //           wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
  //       >
  //           <TableContainer
  //               maxW={'none'}
  //               borderWidth={'1px'} borderRadius={'block'}
  //               width={['100%', '100%', '100%', '50%']}
  //               m={0}
  //           >
  //               {!document.error
  //                 ? <Table variant={'simple'}>
  //                       <Thead>
  //                           <Tr>
  //                               <Th pr={0}>Document info</Th>
  //                               <Th></Th>
  //                           </Tr>
  //                       </Thead>
  //                       <Tbody>
  //                           <Tr>
  //                               <Td w={tdTitleWidth}>Identifier</Td>
  //                               <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
  //                                   <LoadingLine loading={document.loading}>{document.data?.identifier}</LoadingLine>
  //                               </Td>
  //                           </Tr>
  //                           <Tr>
  //                               <Td w={tdTitleWidth}>Owner</Td>
  //                               <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
  //                                   <LoadingLine loading={document.loading}>
  //                                       <Link href={`/identity/${document.data?.owner}`}>{document.data?.owner}</Link>
  //                                   </LoadingLine>
  //                               </Td>
  //                           </Tr>
  //                           <Tr>
  //                               <Td w={tdTitleWidth}>System</Td>
  //                               <Td>
  //                                   <LoadingLine loading={document.loading}>{document.data?.isSystem ? 'true' : 'false'}</LoadingLine>
  //                               </Td>
  //                           </Tr>
  //                           <Tr>
  //                               <Td w={tdTitleWidth}>Revision</Td>
  //                               <Td>
  //                                   <LoadingLine loading={document.loading}>{document.data?.revision}</LoadingLine>
  //                               </Td>
  //                           </Tr>
  //                       </Tbody>
  //                   </Table>
  //                 : <ErrorMessageBlock/>}
  //           </TableContainer>
  //
  //           <Box w={5} h={5} />
  //
  //           <Container
  //               width={['100%', '100%', '100%', '50%']}
  //               maxW={'none'}
  //               className={'InfoBlock'}
  //               display={'flex'}
  //               flexDirection={'column'}
  //           >
  //               <Heading className={'InfoBlock__Title'} as={'h1'}>Data</Heading>
  //                 {!document.error
  //                   ? <LoadingBlock loading={document.loading}>
  //                       <Code
  //                           borderRadius={'lg'}
  //                           className={'DocumentPage__Code'}
  //                           w={'100%'}
  //                       >
  //                           {!document.loading && JSON.stringify(JSON.parse(document.data?.data), null, 2)}
  //                       </Code>
  //                     </LoadingBlock>
  //                   : <ErrorMessageBlock h={40}/>}
  //           </Container>
  //       </Flex>
  //   </Container>
  // )
}

export default Document
