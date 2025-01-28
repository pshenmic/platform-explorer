import { DocumentIcon, TransactionsIcon } from '../ui/icons'
import { CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueCard } from '../cards'
import './DataContractTotalCard.scss'

function DataContractDigestCard ({ dataContract, rate }) {
  return (
    <div className={'DataContract__InfoBlock DataContract__DigestCard DataContractDigestCard'}>
      <div className={'DataContractDigestCard__RowContainer'}>
        <div className={'DataContractDigestCard__InfoContainer'}>
          <div className={'DataContractDigestCard__InfoContainerTitle'}>
            <TransactionsIcon/>
            <span>Total transactions</span>
          </div>
          <div>40</div>
        </div>

        <div className={'DataContractDigestCard__InfoContainer'}>
          <div className={'DataContractDigestCard__InfoContainerTitle'}>
            <DocumentIcon/>
            <span>Total Documents</span>
          </div>
          <div className={'DataContractDigestCard__InfoContainerValue'}>40</div>
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
        error={dataContract.error}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Identities Interacted:'}
        value={123}
        loading={dataContract.loading}
        error={dataContract.error}
      />

      <InfoLine
        className={'DataContractDigestCard__InfoLine'}
        title={'Total Gas Spent'}
        value={<CreditsBlock credits={123} rate={rate}/>}
        loading={dataContract.loading}
        error={dataContract.error}
      />
    </div>
  )
}

export default DataContractDigestCard
