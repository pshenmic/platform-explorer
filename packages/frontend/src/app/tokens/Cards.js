'use client'

import * as Api from '../../util/Api'
import { TokenDashboardCards } from '../../components/tokens/TokenDashboardCards'
import { useEffect, useState } from 'react'
import { fetchHandlerError, fetchHandlerSuccess } from '../../util'
import { Flex } from '@chakra-ui/react'
import styles from './Cards.module.scss'

export default function Cards () {
  const [tokens, setTokens] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    setTokens({ data: {}, loading: true, error: false })

    Api.getTokensRating(1, 6, 'desc')
      .then(res => fetchHandlerSuccess(setTokens, res))
      .catch(err => fetchHandlerError(setTokens, err))
  }

  useEffect(() => fetchData(), [])

  return (
    <Flex className={styles.Container} direction={'column'} w={'100%'}>
      <div className={styles.Title}>Trending Tokens of the week:</div>
      <TokenDashboardCards
        items={tokens?.data?.resultSet}
        loading={tokens?.loading}
        error={tokens?.error}
      />
    </Flex>
  )
}
