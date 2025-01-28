import { DocumentIcon, TransactionsIcon } from '../ui/icons'
import { CreditsBlock, Identifier, InfoLine, NotActive } from '../data'
import { ValueCard } from '../cards'
import './DataContractDigestCard.scss'

function DataContractDigestCard ({ dataContract, rate }) {
  return (
    <div className={'DataContract__InfoBlock DataContract__DigestCard DataContractDigestCard'}>
      <div className={'DataContractDigestCard__RowContainer'}>
        <div className={'DataContractDigestCard__InfoContainer'}>
          <div className={'DataContractDigestCard__InfoContainerTitle'}>
            <TransactionsIcon/>
            <span>Total transactions</span>
          </div>
          <div>
            {dataContract.data?.transactionsCount !== undefined
              ? dataContract.data?.transactionsCount
              : <NotActive/>
            }
          </div>
        </div>

        <div className={'DataContractDigestCard__InfoContainer'}>
          <div className={'DataContractDigestCard__InfoContainerTitle'}>
            <DocumentIcon/>
            <span>Total Documents</span>
          </div>
          <div className={'DataContractDigestCard__InfoContainerValue'}>
            {dataContract.data?.documentsCount !== undefined
              ? dataContract.data?.documentsCount
              : <NotActive/>
            }
          </div>
        </div>
      </div>

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
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
