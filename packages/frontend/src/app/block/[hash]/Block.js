'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
import { ErrorMessageBlock } from '../../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import {
  Container,
  Tabs, TabList, Tab, TabPanels, TabPanel
} from '@chakra-ui/react'
import { BlockDigestCard, BlockTotalCard, QuorumMembersList } from '../../../components/blocks'
import './Block.scss'

function Block ({ hash }) {
  const [block, setBlock] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

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
        <Tabs>
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
              {!block.error
                ? <TransactionsList
                    transactions={block.data?.txs}
                    rate={rate.data}
                  />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!block.error
                ? <QuorumMembersList
                    members={block?.data?.quorum?.members}
                    loading={block.loading}
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

export default Block
