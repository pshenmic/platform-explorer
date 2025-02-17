import { DocumentIcon, MembersIcon, QueuePositionIcon, TransactionsIcon } from '../ui/icons'
import { CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueCard } from '../cards'
import './BlockDigestCard.scss'

function BlockDigestCard ({ block, rate }) {
  console.log(block)

  return (
    <div
      className={`Block__InfoBlock Block__DigestCard BlockDigestCard ${block.loading ? 'BlockDigestCard--Loading' : ''}`}>

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
            value={'123'}
            loading={block.loading}
            error={block.error}
          />
        </div>
      </div>

      <div className={'BlockDigestCard__RowContainer'}>
        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--QuorumIndex'}
            title={(<span><QueuePositionIcon/>Quorum Index</span>)}
            value={block?.data?.quorum?.quorumIndex}
            loading={block.loading}
            error={block.error || block?.data?.quorum?.quorumIndex === undefined}
          />
        </div>

        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--QuorumMembers'}
            title={(<span><MembersIcon/>Quorum Members</span>)}
            value={block?.data?.quorum?.members?.length}
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
              copyButton={true}
              ellipsis={true}
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
        error={block.error || !block.data?.header?.totalGasUsed}
      />
    </div>
  )
}

export default BlockDigestCard
