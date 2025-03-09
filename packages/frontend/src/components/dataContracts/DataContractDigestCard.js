import { DocumentIcon, TransactionsIcon } from '../ui/icons'
import { Alias, CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueCard } from '../cards'
import { findActiveAlias } from '../../util'
import './DataContractDigestCard.scss'

function DataContractDigestCard ({ dataContract, rate }) {
  const topIdentityActiveAlias = findActiveAlias(dataContract?.data?.topIdentity?.aliases)

  return (
    <div className={`DataContract__InfoBlock DataContract__DigestCard DataContractDigestCard ${dataContract.loading ? 'DataContractDigestCard--Loading' : ''}`}>
      <div className={'DataContractDigestCard__RowContainer'}>
        <div className={'DataContractDigestCard__InfoContainer'}>
          <InfoLine
            className={'DataContractDigestCard__InfoLine DataContractDigestCard__InfoLine--TotalTransactions'}
            title={(<span><TransactionsIcon/>Total transactions</span>)}
            value={dataContract.data?.transactionsCount}
            loading={dataContract.loading}
            error={dataContract.error || dataContract.data?.transactionsCount === undefined}
          />
        </div>

        <div className={'DataContractDigestCard__InfoContainer'}>
          <InfoLine
            className={'DataContractDigestCard__InfoLine DataContractDigestCard__InfoLine--DocumentsCount'}
            title={(<span><DocumentIcon/>Total Documents</span>)}
            value={dataContract.data?.documentsCount}
            loading={dataContract.loading}
            error={dataContract.error || dataContract.data?.documentsCount === undefined}
          />
        </div>
      </div>

      <InfoLine
        className={'DataContractDigestCard__InfoLine DataContractDigestCard__InfoLine--TopIdentity'}
        title={'Top Identity'}
        value={(
          <ValueCard link={`/identity/${dataContract.data?.topIdentity?.identifier}`}>
            {topIdentityActiveAlias
              ? <Alias avatarSource={dataContract.data?.topIdentity?.identifier}>{topIdentityActiveAlias.alias}</Alias>
              : <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {dataContract.data?.topIdentity?.identifier}
              </Identifier>
            }
          </ValueCard>
        )}
        loading={dataContract.loading}
        error={dataContract.error || !dataContract.data?.topIdentity}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Identities Interacted'}
        value={dataContract.data?.identitiesInteracted}
        loading={dataContract.loading}
        error={dataContract.error || !dataContract.data?.identitiesInteracted}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Total Gas Spent'}
        value={<CreditsBlock credits={dataContract.data?.totalGasUsed} rate={rate}/>}
        loading={dataContract.loading}
        error={dataContract.error}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Average Gas Spent'}
        value={<CreditsBlock credits={dataContract.data?.averageGasUsed} rate={rate}/>}
        loading={dataContract.loading}
        error={dataContract.error}
      />
    </div>
  )
}

export default DataContractDigestCard
