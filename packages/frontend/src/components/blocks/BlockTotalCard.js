'use client'

import * as Api from '../../util/Api'
import { DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { ValueContainer } from '../ui/containers'
import { BlockIcon, ChevronIcon } from '../ui/icons'
import { ValueCard } from '../cards'
import { fetchHandlerError, fetchHandlerSuccess } from '../../util'
import { useEffect, useState } from 'react'
import './BlockTotalCard.scss'

function BlockTotalCard ({ block, l1explorerBaseUrl, className }) {
  const [blocks, setBlocks] = useState({ data: {}, loading: true, error: false })
  const blockData = block?.data?.header
  const [previousBlock] = blocks.data?.resultSet?.filter(block => block?.header?.height === blockData?.height - 1) || []
  const [nextBlock] = blocks.data?.resultSet?.filter(block => block?.header?.height === blockData?.height + 1) || []

  const fetchData = () => {
    if (!blockData?.height) return

    setBlocks(state => ({ ...state, loading: true }))

    Api.getBlocks(1, 3, 'desc', { height_min: Math.max(blockData?.height - 1, 1), height_max: blockData?.height + 1 })
      .then(res => fetchHandlerSuccess(setBlocks, res))
      .catch(err => fetchHandlerError(setBlocks, err))
  }

  useEffect(fetchData, [blockData])

  return (
    <div className={`InfoBlock InfoBlock--Gradient BlockTotalCard ${block?.loading ? 'BlockTotalCard--Loading' : ''} ${className || ''}`}>
      {block.data?.name &&
        <div className={'BlockTotalCard__Title'}>
          {block.data.name}
        </div>
      }

      <div className={'BlockTotalCard__Header'}>
        <div className={'BlockTotalCard__HeaderLines'}>
          <InfoLine
            className={'BlockTotalCard__InfoLine--Hash'}
            title={'Block Hash'}
            loading={block.loading}
            error={block.error || !block?.data?.header?.hash}
            value={
              <Identifier
                copyButton={true}
                styles={['highlight-both']}
                ellipsis={false}
              >
                {block?.data?.header?.hash}
              </Identifier>
            }
          />

          <InfoLine
            className={'BlockTotalCard__Owner'}
            title={'L1 Locked Height'}
            loading={block.loading}
            error={block.error}
            value={
              <ValueContainer external={true} link={`${l1explorerBaseUrl}/block/${block.data?.header?.l1LockedHeight}`}>
                {block.data?.header?.l1LockedHeight}
              </ValueContainer>
            }
          />
        </div>
        <div className={'BlockTotalCard__Avatar'}>
          <BlockIcon/>
        </div>
      </div>

      <HorisontalSeparator className={'BlockTotalCard__Separator'}/>

      <div className={'BlockTotalCard__CommonInfo'}>
        <InfoLine
          title={'Height'}
          value={
            <div className={'BlockTotalCard__BlockHeight'}>
              {previousBlock &&
                <ValueCard link={`/block/${previousBlock.header?.hash}`}>
                  <ChevronIcon transform={'rotate(180deg)'}/>
                </ValueCard>
              }
              <div>{blockData?.height}</div>
              {nextBlock &&
                <ValueCard link={`/block/${nextBlock.header?.hash}`}>
                  <ChevronIcon/>
                </ValueCard>
              }
            </div>
          }
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          className={'BlockTotalCard__InfoLine BlockTotalCard__InfoLine--AppHash'}
          title={'App Hash'}
          value={
            <Identifier styles={['highlight-both']} ellipsis={false}>
              {blockData?.appHash}
            </Identifier>
          }
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          className={'BlockTotalCard__InfoLine BlockTotalCard__InfoLine--QuorumHash'}
          title={'Quorum Hash'}
          value={
            <Identifier styles={['highlight-both']} ellipsis={false}>
              {block?.data?.quorum?.quorumHash}
            </Identifier>
          }
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          title={'Block Version'}
          value={blockData?.blockVersion}
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          title={'Timestamp'}
          value={<DateBlock timestamp={blockData?.timestamp}/>}
          loading={block.loading}
          error={block.error}
        />
      </div>
    </div>
  )
}

export default BlockTotalCard
