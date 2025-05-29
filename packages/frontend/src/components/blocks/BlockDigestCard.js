'use client'

import { DocumentIcon, MembersIcon, QueuePositionIcon, TransactionsIcon, InfoIcon } from '../ui/icons'
import { CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueCard } from '../cards'
import { EpochTooltip, Tooltip } from '../ui/Tooltips'
import './BlockDigestCard.scss'

function BlockDigestCard ({ block, rate, status }) {
  return (
    <div className={`Block__InfoBlock Block__DigestCard BlockDigestCard ${block.loading ? 'BlockDigestCard--Loading' : ''}`}>
      <div className={'BlockDigestCard__RowContainer'}>
        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--TotalTransactions'}
            title={(<span><TransactionsIcon/>Total transactions</span>)}
            value={block?.data?.txs?.length}
            loading={block.loading}
            error={block.error || block?.data?.txs?.length === undefined}
          />
        </div>

        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--Epoch'}
            title={(<span><DocumentIcon/>Epoch</span>)}
            value={
              <EpochTooltip epoch={status?.data?.epoch}>
                <span className={'BlockDigestCard__InfoLineValueContent'}>
                  #{status?.data?.epoch?.number}
                  <InfoIcon className={'BlockDigestCard__InfoIcon'}/>
                </span>
              </EpochTooltip>
            }
            loading={status.loading}
            error={status.error}
          />
        </div>
      </div>

      <div className={'BlockDigestCard__RowContainer'}>
        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--QuorumIndex'}
            title={<span><QueuePositionIcon/>Quorum Index</span>}
            value={
              <Tooltip
                title={'Quorum Index'}
                content={'Position of the quorum among all active quorum groups'}
              >
                <span className={'BlockDigestCard__InfoLineValueContent'}>
                  {block?.data?.quorum?.quorumIndex}
                  <InfoIcon className={'BlockDigestCard__InfoIcon'}/>
                </span>
              </Tooltip>
            }
            loading={block.loading}
            error={block.error || typeof block?.data?.quorum?.quorumIndex !== 'number'}
          />
        </div>

        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--QuorumMembers'}
            title={(<span><MembersIcon/>Quorum Members</span>)}
            value={
              <Tooltip
                title={'Quorum Members'}
                content={'Amount of quorum\'s participants that have signed this platform block'}
              >
                <span className={'BlockDigestCard__InfoLineValueContent'}>
                  {block?.data?.quorum?.members?.length}
                  <InfoIcon className={'BlockDigestCard__InfoIcon'}/>
                </span>
              </Tooltip>
            }
            loading={block.loading}
            error={block.error || block?.data?.quorum?.members?.length === undefined}
          />
        </div>
      </div>

      <InfoLine
        className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--Validator'}
        title={'Validator'}
        value={(
          <ValueCard link={`/validator/${block.data?.header?.validator}`}>
            <Identifier
              avatar={true}
              ellipsis={false}
              styles={['highlight-both']}
            >
              {block.data?.header?.validator}
            </Identifier>
          </ValueCard>
        )}
        loading={block.loading}
        error={block.error || !block.data?.header?.validator}
      />

      <InfoLine
        className={'BlockDigestCard__InfoLine'}
        title={'Total Fees'}
        value={<CreditsBlock credits={block.data?.header?.totalGasUsed} rate={rate}/>}
        loading={block.loading}
        error={block.error}
      />
    </div>
  )
}

export default BlockDigestCard
