import { DocumentIcon, TransactionsIcon } from '../ui/icons'
import { CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueCard } from '../cards'
import './DataContractDigestCard.scss'

function DataContractDigestCard ({ dataContract, rate }) {
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
          <ValueCard link={`/identity/${dataContract.data?.topIdentity}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {dataContract.data?.topIdentity}
            </Identifier>
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
        value={<CreditsBlock credits={dataContract.data?.totalGasSpent} rate={rate}/>}
        loading={dataContract.loading}
        error={dataContract.error || !dataContract.data?.totalGasSpent}
      />
    </div>
  )
}

export default DataContractDigestCard
