import { DocumentIcon, TransactionsIcon } from '../ui/icons'
import { Alias, CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueCard } from '../cards'
import { findActiveAlias } from '../../util'
import './BlockDigestCard.scss'

function BlockDigestCard ({ block, rate }) {
  const topIdentityActiveAlias = findActiveAlias(block?.data?.topIdentity?.aliases)

  return (
    <div className={`Block__InfoBlock Block__DigestCard BlockDigestCard ${block.loading ? 'BlockDigestCard--Loading' : ''}`}>
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
            title={(<span><DocumentIcon/>Total Documents</span>)}
            value={block.data?.documentsCount}
            loading={block.loading}
            error={block.error || block.data?.documentsCount === undefined}
          />
        </div>
      </div>

      <InfoLine
        className={'BlockDigestCard__InfoLine BlockDigestCard__InfoLine--TopIdentity'}
        title={'Top Identity'}
        value={(
          <ValueCard link={`/identity/${block.data?.topIdentity?.identifier}`}>
            {topIdentityActiveAlias
              ? <Alias avatarSource={block.data?.topIdentity?.identifier}>{topIdentityActiveAlias.alias}</Alias>
              : <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {block.data?.topIdentity?.identifier}
              </Identifier>
            }
          </ValueCard>
        )}
        loading={block.loading}
        error={block.error || !block.data?.topIdentity}
      />

      <InfoLine
        className={'BlockDigestCard__InfoLine'}
        title={'Identities Interacted'}
        value={block.data?.identitiesInteracted}
        loading={block.loading}
        error={block.error || !block.data?.identitiesInteracted}
      />

      <InfoLine
        className={'BlockDigestCard__InfoLine'}
        title={'Total Gas Spent'}
        value={<CreditsBlock credits={block.data?.totalGasUsed} rate={rate}/>}
        loading={block.loading}
        error={block.error || !block.data?.totalGasUsed}
      />

      <InfoLine
        className={'BlockDigestCard__InfoLine'}
        title={'Average Gas Spent'}
        value={<CreditsBlock credits={block.data?.averageGasUsed} rate={rate}/>}
        loading={block.loading}
        error={block.error || !block.data?.averageGasUsed}
      />
    </div>
  )
}

export default BlockDigestCard
