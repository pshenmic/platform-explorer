'use client'

import { IdentitiesCards } from '../../components/identities'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { SideBlock } from '../../components/containers'
import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { Flex, Box } from '@chakra-ui/react'

export default function Cards () {
  const [identities, setIdentities] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getIdentities(1, 3, 'desc', 'balance')
      .then(res => fetchHandlerSuccess(setIdentities, res))
      .catch(err => fetchHandlerError(setIdentities, err))
  }

  useEffect(fetchData, [])

  return (
    <SideBlock>
        <Flex justifyContent={'space-between'} px={6} mb={4}>
            <div>Top Identities:</div>
            <Box color={'gray.500'}>Balance</Box>
        </Flex>

        <IdentitiesCards items={identities}/>
    </SideBlock>
  )
}
