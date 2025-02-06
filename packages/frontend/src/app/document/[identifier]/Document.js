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
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import './Document.scss'

const pagintationConfig = {
  itemsOnPage: {
    default: 10,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Document ({ identifier }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [document, setDocument] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [revisions, setRevisions] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const searchParams = useSearchParams()
  const DocumentId = searchParams.get('contract-id') || null
  const typeName = searchParams.get('document-type-name') || null
  const pageSize = pagintationConfig.itemsOnPage.default

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Data Contracts', path: '/dataContracts' },
      {
        label: document?.data?.dataContractIdentifier,
        path: `/dataContract/${document?.data?.dataContractIdentifier}`,
        avatar: true,
        shrink: true
      },
      { label: identifier, avatar: true }
    ])
  }, [setBreadcrumbs, identifier, document])

  const fetchData = () => {
    setDocument(state => ({ ...state, loading: true }))

    Api.getDocumentByIdentifier(identifier, DocumentId, typeName)
      .then(document => fetchHandlerSuccess(setDocument, document))
      .catch(err => fetchHandlerError(setDocument, err))
  }

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
            ? <LoadingBlock h={'100%'} minH={'200px'} loading={document.loading}>
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
}

export default Document
