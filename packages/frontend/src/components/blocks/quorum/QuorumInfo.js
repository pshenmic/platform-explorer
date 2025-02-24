import { Identifier, InfoLine } from '../../data'
import { ValueContainer } from '../../ui/containers'
import { Badge } from '@chakra-ui/react'
import './QuorumInfo.scss'

export default function QuorumInfo ({ quorum, loading, l1explorerBaseUrl }) {
  return (
    <div className={'QuorumInfo'}>
      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'Quorum Hash'}
          value={<Identifier styles={['highlight-both']} ellipsis={false} copyButton={true}>{quorum?.quorumHash}</Identifier>}
          loading={loading}
          error={!quorum?.quorumHash}
        />
      </div>

      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'Quorum Index'}
          value={quorum?.quorumIndex}
          loading={loading}
          error={typeof quorum?.quorumIndex !== 'number'}
        />
      </div>

      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'LLMQ Type'}
          value={<Badge colorScheme={'gray'}>{quorum?.type}</Badge>}
          loading={loading}
          error={!quorum?.type}
        />
      </div>

      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'Quorum Block Height'}
          value={
            <ValueContainer
              size={'md'}
              external={true}
              link={`${l1explorerBaseUrl}/block/${quorum?.blockHeight}`}
            >
              {quorum?.blockHeight}
            </ValueContainer>
          }
          loading={loading}
          error={typeof quorum?.blockHeight !== 'number'}
        />
      </div>

      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'Quorum Creation Height'}
          value={
            <ValueContainer
              size={'md'}
              external={true}
              link={`${l1explorerBaseUrl}/block/${quorum?.creationHeight}`}
            >
              {quorum?.creationHeight}
            </ValueContainer>
          }
          loading={loading}
          error={typeof quorum?.creationHeight !== 'number'}
        />
      </div>

      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'Quorum Mined Block Hash'}
          value={
            <ValueContainer
              size={'md'}
              external={true}
              link={`${l1explorerBaseUrl}/block/${quorum?.minedBlockHash}`}
            >
              <Identifier styles={['highlight-both']} ellipsis={false}>{quorum?.minedBlockHash}</Identifier>
            </ValueContainer>
          }
          loading={loading}
          error={!quorum?.minedBlockHash}
        />
      </div>

      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'Total Valid Members'}
          value={quorum?.numValidMembers}
          loading={loading}
          error={typeof quorum?.numValidMembers !== 'number'}
        />
      </div>

      {(quorum?.previousConsecutiveDKGFailures || loading) &&
        <div className={'QuorumInfo__LineContainer'}>

          <InfoLine
            className={'QuorumInfo__InfoLine'}
            title={'Previous DKG Failures'}
            value={quorum?.previousConsecutiveDKGFailures}
            loading={loading}
          />
        </div>
      }

      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'Health Ratio'}
          value={
            <Badge
              colorScheme={(() => {
                if (quorum?.healthRatio > 0.75) return 'green'
                if (quorum?.healthRatio > 0.5) return 'yellow'
                if (quorum?.healthRatio > 0.25) return 'orange'
                return 'red'
              })()}
            >
              {quorum?.healthRatio}
            </Badge>
          }
          loading={loading}
          error={quorum?.healthRatio === undefined || quorum?.healthRatio === null}
        />
      </div>
    </div>
  )
}
