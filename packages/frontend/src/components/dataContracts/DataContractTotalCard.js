import ImageGenerator from '../imageGenerator'
import { Alias, DateBlock, Identifier, InfoLine } from '../data'
import { ValueCard } from '../cards'
import { findActiveAlias } from '../../util'
import { DataContractTitle } from './DataContractTitle'

import './DataContractTotalCard.scss'

function DataContractTotalCard ({ dataContract, className }) {
  const activeAlias = findActiveAlias(dataContract?.data?.owner?.aliases)

  return (
    <div className={`InfoBlock InfoBlock--Gradient DataContractTotalCard ${dataContract.loading ? 'DataContractTotalCard--Loading' : ''} ${className || ''}`}>
      <DataContractTitle dataContract={dataContract.data} />
      <div className={'DataContractTotalCard__Header'}>
        <div className={'DataContractTotalCard__HeaderLines'}>
          <InfoLine
            className={'DataContractTotalCard__Identifier'}
            title={'Identifier'}
            loading={dataContract.loading}
            error={dataContract.error || !dataContract.data?.identifier}
            value={
              <Identifier
                copyButton={true}
                styles={['highlight-both']}
                ellipsis={false}
              >
                {dataContract.data?.identifier}
              </Identifier>
            }
          />

          <InfoLine
            className={'DataContractTotalCard__Owner'}
            title={'Owner'}
            loading={dataContract.loading}
            error={dataContract.error}
            value={
              <ValueCard link={`/identity/${dataContract.data?.owner?.identifier}`}>
                {activeAlias
                  ? <Alias avatarSource={dataContract.data?.owner?.identifier}>{activeAlias.alias}</Alias>
                  : <Identifier
                    avatar={true}
                    className={''}
                    copyButton={true}
                    styles={['highlight-both']}
                    ellipsis={false}
                  >
                    {dataContract.data?.owner?.identifier}
                  </Identifier>
                }
              </ValueCard>
            }
          />

          <InfoLine
            className={'DataContractTotalCard__Keywords'}
            title={'Keywords'}
            loading={dataContract.loading}
            error={dataContract.error || !dataContract.data?.keywords?.length}
            value={
              <div className={'DataContractTotalCard__KeywordsList'}>
                {dataContract.data?.keywords?.map((kw, i) => (
                  <ValueCard key={i}>{kw}</ValueCard>
                ))}
              </div>
            }
          />

          <InfoLine
            className={'DataContractTotalCard__InfoLine DataContractTotalCard__InfoLine--Description'}
            title={'Description'}
            loading={dataContract.loading}
            error={dataContract.error || !dataContract.data?.description}
            value={
              <ValueCard className={'DataContractTotalCard__DescriptionValue'}>
                {dataContract.data?.description}
              </ValueCard>
            }
          />

          <InfoLine
            className={'DataContractTotalCard__CreationDate'}
            title={'Creation Date'}
            loading={dataContract.loading}
            error={dataContract.error}
            value={dataContract?.data?.txHash
              ? <ValueCard link={`/transaction/${dataContract.data?.txHash}`}>
                  <DateBlock timestamp={dataContract.data?.timestamp}/>
                </ValueCard>
              : <DateBlock timestamp={dataContract.data?.timestamp}/>
            }
          />
        </div>
        <div className={'DataContractTotalCard__Avatar'}>
          {!dataContract.error
            ? <ImageGenerator
              username={dataContract.data?.identifier}
              lightness={50}
              saturation={50}
              width={88}
              height={88}
            />
            : 'n/a'
          }
        </div>
      </div>
    </div>
  )
}

export default DataContractTotalCard
