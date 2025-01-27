import ImageGenerator from '../imageGenerator'
import { DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import './DataContractTotalCard.scss'

function DataContractTotalCard ({ dataContract, rate, className }) {
  console.log('dataContract', dataContract)

  return (
    <div className={`InfoBlock InfoBlock--Gradient DataContractTotalCard ${dataContract.loading ? 'DataContractTotalCard--Loading' : ''} ${className || ''}`}>
      {dataContract.data?.name &&
        <div className={'DataContractTotalCard__ContractName'}>
          {dataContract.data.name}
        </div>
      }

      <div className={'DataContractTotalCard__Header'}>
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

        <div className={'DataContractTotalCard__HeaderLines'}>
          <InfoLine
            className={'DataContractTotalCard__Identifier'}
            title={'Identifier'}
            loading={dataContract.loading}
            error={dataContract.error}
            value={
              <Identifier
                className={''}
                copyButton={true}
                styles={['highlight-both']}
                ellipsis={false}
              >
                {dataContract.data?.identifier}
              </Identifier>
            }
          />

          <InfoLine
            className={'DataContractTotalCard__Identifier'}
            title={'Owner'}
            loading={dataContract.loading}
            error={dataContract.error}
            value={
              <Identifier
                avatar={true}
                className={''}
                copyButton={true}
                styles={['highlight-both']}
                ellipsis={false}
              >
                {dataContract.data?.owner}
              </Identifier>
            }
          />
        </div>
      </div>

      <HorisontalSeparator className={'DataContractTotalCard__Separator'}/>

      <div className={'DataContractTotalCard__CommonInfo'}>

        <InfoLine
          title={'Revision'}
          value={dataContract.data?.version}
          loading={dataContract.loading}
          error={dataContract.error}
        />

        <InfoLine
          title={'Creation Date'}
          value={<DateBlock timestamp={dataContract.data?.timestamp}/>}
          loading={dataContract.loading}
          error={dataContract.error}
        />
      </div>
    </div>
  )
}

export default DataContractTotalCard
