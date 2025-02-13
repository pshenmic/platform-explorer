import { DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { ValueContainer } from '../ui/containers'
import './BlockTotalCard.scss'
import { BlockIcon } from '../ui/icons'

function BlockTotalCard ({ block, className }) {
  const blockData = block?.data?.header

  console.log('block?.data?.header', block?.data?.header)

  return (
    <div className={`InfoBlock InfoBlock--Gradient BlockTotalCard ${block?.loading ? 'BlockTotalCard--Loading' : ''} ${className || ''}`}>
      {block.data?.name &&
        <div className={'BlockTotalCard__Title'}>
          {block.data.name}
        </div>
      }

      <div className={'BlockTotalCard__Header'}>
        <div className={'BlockTotalCard__Avatar'}>
          <BlockIcon/>
        </div>

        <div className={'BlockTotalCard__HeaderLines'}>
          <InfoLine
            className={'BlockTotalCard__Identifier'}
            title={'Block Hash'}
            loading={block.loading}
            error={block.error || !block?.data?.header?.hash}
            value={
              <Identifier
                copyButton={true}
                styles={['highlight-both']}
                ellipsis={false}
              >
                {block?.data?.header?.hash}
              </Identifier>
            }
          />

          <InfoLine
            className={'BlockTotalCard__Owner'}
            title={'L1 Locked Height'}
            loading={block.loading}
            error={block.error}
            value={
              <ValueContainer external={true} link={`/identity/${block.data?.header?.l1LockedHeight}`}>
                {block.data?.header?.l1LockedHeight}
              </ValueContainer>
            }
          />
        </div>
      </div>

      <HorisontalSeparator className={'BlockTotalCard__Separator'}/>

      <div className={'BlockTotalCard__CommonInfo'}>
        <InfoLine
          title={'Height'}
          value={blockData?.height}
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          title={'App Hash'}
          value={
            <Identifier
              styles={['highlight-both']}
              ellipsis={false}
            >
              {blockData?.appHash}
            </Identifier>
          }
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          title={'Quorum Hash'}
          value={
            <Identifier
              styles={['highlight-both']}
              ellipsis={false}
            >
              {block?.data?.quorum?.quorumHash}
            </Identifier>
          }
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          title={'Block Version'}
          value={blockData?.blockVersion}
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          title={'Timestamp'}
          value={<DateBlock timestamp={blockData?.timestamp}/>}
          loading={block.loading}
          error={block.error}
        />
      </div>
    </div>
  )
}

export default BlockTotalCard
