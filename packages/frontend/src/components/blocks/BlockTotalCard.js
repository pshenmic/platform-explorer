import ImageGenerator from '../imageGenerator'
import { Alias, DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { ValueCard } from '../cards'
import { findActiveAlias } from '../../util'
import './BlockTotalCard.scss'

function BlockTotalCard ({ dataContract, className }) {
  const activeAlias = findActiveAlias(dataContract?.data?.owner?.aliases)

  return (
    <div className={`InfoBlock InfoBlock--Gradient BlockTotalCard ${dataContract.loading ? 'BlockTotalCard--Loading' : ''} ${className || ''}`}>
      {dataContract.data?.name &&
        <div className={'BlockTotalCard__Title'}>
          {dataContract.data.name}
        </div>
      }

      <div className={'BlockTotalCard__Header'}>
        <div className={'BlockTotalCard__Avatar'}>
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

        <div className={'BlockTotalCard__HeaderLines'}>
          <InfoLine
            className={'BlockTotalCard__Identifier'}
            title={'Identifier'}
            loading={dataContract.loading}
            error={dataContract.error || !dataContract.data?.identifier}
            value={
              <Identifier
                className={''}
                copyButton={true}
                styles={['highlight-both', `size-${dataContract.data?.identifier?.length}`]}
                ellipsis={false}
              >
                {dataContract.data?.identifier}
              </Identifier>
            }
          />

          <InfoLine
            className={'BlockTotalCard__Owner'}
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
        </div>
      </div>

      <HorisontalSeparator className={'BlockTotalCard__Separator'}/>

      <div className={'BlockTotalCard__CommonInfo'}>
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

export default BlockTotalCard
