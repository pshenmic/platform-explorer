'use client'

import * as Api from '../../util/Api'
import { TokenDashboardCards } from '../../components/tokens/TokenDashboardCards'
import { useEffect, useState } from 'react'
import { fetchHandlerError, fetchHandlerSuccess } from '../../util'
import { Flex } from '@chakra-ui/react'
import { EmptyListMessage } from '../../components/ui/lists'
import styles from './Cards.module.scss'

export default function Cards () {
  const [tokens, setTokens] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    setTokens({ data: {}, loading: true, error: false })

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days

    Api.getTokensRating(1, 6, 'desc', {
      timestamp_start: startDate.toISOString(),
      timestamp_end: endDate.toISOString()
    })
      .then(res => fetchHandlerSuccess(setTokens, res))
      .catch(err => fetchHandlerError(setTokens, err))
  }

  useEffect(() => fetchData(), [])

  return tokens?.data?.resultSet?.length > 0
    ? <Flex className={styles.Container} direction={'column'} w={'100%'} gap={'1rem'}>
      <div className={styles.Title}>Trending Tokens of the week:</div>
      <TokenDashboardCards
        items={tokens?.data?.resultSet}
        loading={tokens?.loading}
        error={tokens?.error}
      />
    </Flex>
    : <Flex className={styles.Container} direction={'column'} w={'100%'} gap={'1rem'}>
        <EmptyListMessage>There are no tokens yet.</EmptyListMessage>
      </Flex>
}
