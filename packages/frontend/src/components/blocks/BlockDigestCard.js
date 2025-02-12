import { DocumentIcon, TransactionsIcon } from '../ui/icons'
import { Alias, CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueCard } from '../cards'
import { findActiveAlias } from '../../util'
import './BlockDigestCard.scss'

function BlockDigestCard ({ block, rate }) {
  const topIdentityActiveAlias = findActiveAlias(block?.data?.topIdentity?.aliases)

  return (
    <div
      className={`Block__InfoBlock Block__DigestCard BlockDigestCard ${block.loading ? 'BlockDigestCard--Loading' : ''}`}>

      <div className={'BlockDigestCard__RowContainer'}>
        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--TotalTransactions'}
            title={(<span><TransactionsIcon/>Total transactions</span>)}
            value={block.data?.transactionsCount}
            loading={block.loading}
            error={block.error || block.data?.transactionsCount === undefined}
          />
        </div>

        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--DocumentsCount'}
            title={(<span><DocumentIcon/>Epoch</span>)}
            value={'123'}
            loading={block.loading}
            error={block.error || block.data?.documentsCount === undefined}
          />
        </div>
      </div>

      <div className={'BlockDigestCard__RowContainer'}>
        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--TotalTransactions'}
            title={(<span><TransactionsIcon/>Quorum Index</span>)}
            value={'123'}
            loading={block.loading}
            error={block.error || block.data?.transactionsCount === undefined}
          />
        </div>

        <div className={'BlockDigestCard__InfoContainer'}>
          <InfoLine
            className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--DocumentsCount'}
            title={(<span><DocumentIcon/>Quorum Members</span>)}
            value={'123'}
            loading={block.loading}
            error={block.error || block.data?.documentsCount === undefined}
          />
        </div>
      </div>

      <InfoLine
        className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--TopIdentity'}
        title={'Validator'}
        value={(
          <ValueCard link={`/identity/${block.data?.topIdentity?.identifier}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {block.data?.topIdentity?.identifier}
            </Identifier>
          </ValueCard>
        )}
        loading={block.loading}
        error={block.error || !block.data?.topIdentity}
      />

      <InfoLine
        className={'BlockDigestCard__InfoLine'}
        title={'Total Fees'}
        value={<CreditsBlock credits={123} rate={rate}/>}
        loading={block.loading}
        error={block.error || !block.data?.totalGasUsed}
      />
    </div>
  )
}

export default BlockDigestCard
