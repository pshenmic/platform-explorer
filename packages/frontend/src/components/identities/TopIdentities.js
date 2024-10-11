'use client'

import { IdentitiesCards } from '../identities'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { Flex, Box, Heading } from '@chakra-ui/react'
import './TopIdentities.scss'

export default function TopIdentities ({ className, blockBorders = false }) {
  const [identities, setIdentities] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getIdentities(1, 3, 'desc', 'balance')
      .then(res => fetchHandlerSuccess(setIdentities, res))
      .catch(err => fetchHandlerError(setIdentities, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [])

  return (
    <div className={`InfoBlock ${!blockBorders ? 'InfoBlock--NoBorder' : ''} TopIdentities ${className || ''}`}>
      <Heading className={'InfoBlock__Title'} as={'h1'}>Top Identities</Heading>

      <Flex justifyContent={'space-between'} px={6} mb={4}>
        <div>Identifier</div>
        <Box color={'gray.500'}>Balance</Box>
      </Flex>

      <IdentitiesCards items={identities} rate={rate.data}/>
    </div>
  )
}
