import ImageGenerator from '../imageGenerator'
import { Alias, DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { ValueCard } from '../cards'
import { findActiveAlias } from '../../util'
import './BlockTotalCard.scss'

function BlockTotalCard ({ block, className }) {
  const activeAlias = findActiveAlias(block?.data?.owner?.aliases)

  return (
    <div className={`InfoBlock InfoBlock--Gradient BlockTotalCard ${block?.loading ? 'BlockTotalCard--Loading' : ''} ${className || ''}`}>
      {block.data?.name &&
        <div className={'BlockTotalCard__Title'}>
          {block.data.name}
        </div>
      }

      <div className={'BlockTotalCard__Header'}>
        <div className={'BlockTotalCard__Avatar'}>
          {!block.error
            ? <ImageGenerator
              username={block.data?.identifier}
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
            loading={block.loading}
            error={block.error || !block.data?.identifier}
            value={
              <Identifier
                className={''}
                copyButton={true}
                styles={['highlight-both', `size-${block.data?.identifier?.length}`]}
                ellipsis={false}
              >
                {block.data?.identifier}
              </Identifier>
            }
          />

          <InfoLine
            className={'BlockTotalCard__Owner'}
            title={'Owner'}
            loading={block.loading}
            error={block.error}
            value={
              <ValueCard link={`/identity/${block.data?.owner?.identifier}`}>
                {activeAlias
                  ? <Alias avatarSource={block.data?.owner?.identifier}>{activeAlias.alias}</Alias>
                  : <Identifier
                      avatar={true}
                      className={''}
                      copyButton={true}
                      styles={['highlight-both']}
                      ellipsis={false}
                    >
                      {block.data?.owner?.identifier}
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
          value={block.data?.version}
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          title={'Creation Date'}
          value={<DateBlock timestamp={block.data?.timestamp}/>}
          loading={block.loading}
          error={block.error}
        />
      </div>
    </div>
  )
}

export default BlockTotalCard
