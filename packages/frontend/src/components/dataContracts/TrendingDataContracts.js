'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { SimpleList, ListLoadingPreview } from '../../components/lists'
import { Heading, Flex } from '@chakra-ui/react'
import { WarningTwoIcon } from '@chakra-ui/icons'

function ErrorMessageBlock () {
  return (
    <Flex
        flexGrow={1}
        w={'100%'}
        justifyContent={'center'}
        alignItems={'center'}
        flexDirection={'column'}
        opacity={0.5}
    >
        <div><WarningTwoIcon color={'#ddd'} mr={2} mt={-1}/>Error loading data</div>
    </Flex>
  )
}

export default function TrendingDataContracts ({ printCount = 5, preload = 10, previewLines = 5 }) {
  const [dataContracts, setDataContracts] = useState({ data: {}, loading: true, error: false })

  function fetchHandlerSuccess (setter, data) {
    setter(state => ({
      ...state,
      data: {
        ...state.data,
        ...data
      },
      loading: false,
      error: false
    }))
  }

  function fetchHandlerError (setter, error) {
    console.error(error)

    setter(state => ({
      ...state,
      data: null,
      loading: false,
      error: true
    }))
  }

  const fetchData = () => {
    Api.getDataContracts(1, preload, 'desc', 'documents_count')
      .then(paginatedDataContracts => fetchHandlerSuccess(setDataContracts, paginatedDataContracts))
      .catch(err => fetchHandlerError(setDataContracts, err))
  }

  useEffect(fetchData, [preload])

  return (<>
    <Flex
        maxW={'100%'}
        m={0}
        h={'100%'}
        borderWidth={'1px'} borderRadius={'lg'}
        className={'InfoBlock'}
        flexDirection={'column'}
    >
        <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Trending Data Contracts</Heading>
        {!dataContracts.loading
          ? !dataContracts.error
              ? <SimpleList
                items={dataContracts.data.resultSet
                  .filter((item, i) => i < printCount)
                  .map((dataContract, i) => ({
                    columns: [dataContract.identifier, dataContract.documentsCount],
                    link: '/dataContract/' + dataContract.identifier
                  }))}
                columns={['Identifier', 'Documents Count']}
                />
              : <ErrorMessageBlock/>
          : <ListLoadingPreview itemsCount={previewLines}/>}
    </Flex>
  </>)
}
