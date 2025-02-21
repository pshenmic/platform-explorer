import { DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { ValueContainer } from '../ui/containers'
import { BlockIcon } from '../ui/icons'
import './BlockTotalCard.scss'

function BlockTotalCard ({ block, l1explorerBaseUrl, className }) {
  const blockData = block?.data?.header

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
            className={'BlockTotalCard__InfoLine--Hash'}
            title={'Block Hash'}
            loading={block.loading}
            error={block.error || !block?.data?.header?.hash}
            value={
              <Identifier
                copyButton={true}
                styles={['highlight-both', `size-${blockData?.appHash?.length}`]}
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
              <ValueContainer external={true} link={`${l1explorerBaseUrl}/block/${block.data?.header?.l1LockedHeight}`}>
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
          className={'BlockTotalCard__InfoLine BlockTotalCard__InfoLine--AppHash'}
          title={'App Hash'}
          value={
            <Identifier
              styles={['highlight-both', `size-${blockData?.appHash?.length}`]}
              ellipsis={false}
            >
              {blockData?.appHash}
            </Identifier>
          }
          loading={block.loading}
          error={block.error}
        />

        <InfoLine
          className={'BlockTotalCard__InfoLine BlockTotalCard__InfoLine--QuorumHash'}
          title={'Quorum Hash'}
          value={
            <Identifier
              styles={['highlight-both', `size-${block?.data?.quorum?.quorumHash?.length}`]}
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
