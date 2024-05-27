'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { SimpleList, ListLoadingPreview } from '../lists'
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

export default function RichList ({ printCount = 5, preload = 10, previewLines = 8 }) {
  const [richestIdentities, setRichestIdentities] = useState({ data: {}, props: { printCount }, loading: true, error: false })

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
    Api.getIdentities(1, preload, 'desc', 'balance')
      .then(paginatedRichestIdentities => fetchHandlerSuccess(setRichestIdentities, paginatedRichestIdentities))
      .catch(err => fetchHandlerError(setRichestIdentities, err))
  }

  useEffect(fetchData, [preload])

  return (<>
    <Flex
        maxW={'none'}
        borderWidth={'1px'} borderRadius={'lg'}
        className={'InfoBlock'}
        flexGrow={'1'}
        flexDirection={'column'}
    >
        <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Richlist</Heading>
          {!richestIdentities.loading
            ? !richestIdentities.error
                ? <SimpleList
                    items={richestIdentities.data.resultSet
                      .filter((item, i) => i < printCount)
                      .map((identitiy, i) => ({
                        columns: [identitiy.identifier, identitiy.balance],
                        link: '/identity/' + identitiy.identifier
                      }))}
                    columns={['Identifier', 'Balance']}
                  />
                : <ErrorMessageBlock/>
            : <ListLoadingPreview itemsCount={previewLines}/>}
    </Flex>
  </>)
}
