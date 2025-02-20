import { Popover } from './index'
import { Identifier, InfoLine } from '../../data'
import { ValueContainer } from '../containers'
import { Badge } from '@chakra-ui/react'
import './QuorumPopover.scss'

export default function QuorumPopover ({ quorum, header, loading, stateCallback, l1explorerBaseUrl, children }) {
  console.log('quorum', quorum)

  return (
    <Popover stateCallback={stateCallback} className={'QuorumPopover'} trigger={children} header={header}>
      <InfoLine
        title={'Quorum Hash'}
        value={<Identifier styles={['highlight-both']} ellipsis={false}>{quorum?.quorumHash}</Identifier>}
        loading={loading}
        error={!quorum?.quorumHash}
      />

      <InfoLine
        title={'Quorum Index'}
        value={quorum?.quorumIndex}
        loading={loading}
        error={typeof quorum?.quorumIndex !== 'number'}
      />

      <InfoLine
        title={'LLMQ Type'}
        value={<Badge colorScheme={'gray'}>{quorum?.type}</Badge>}
        loading={loading}
        error={!quorum?.type}
      />

      {/* <InfoLine */}
      {/*   title={'Quorum Block Height'} */}
      {/*   value={''} */}
      {/*   loading={loading} */}
      {/*   error={false} */}
      {/* /> */}

      <InfoLine
        title={'Quorum Creation Height'}
        value={
          <ValueContainer external={true} link={`${l1explorerBaseUrl}/block/${quorum?.creationHeight}`}>
            {quorum?.creationHeight}
          </ValueContainer>
        }
        loading={loading}
        error={typeof quorum?.creationHeight !== 'number'}
      />

      <InfoLine
        title={<>Quorum Mined <br/> Block Hash</>}
        value={<Identifier styles={['highlight-both']} ellipsis={false}>{quorum?.minedBlockHash}</Identifier>}
        loading={loading}
        error={!quorum?.minedBlockHash}
      />

      <InfoLine
        title={'Total Valid Members'}
        value={quorum?.numValidMembers}
        loading={loading}
        error={typeof quorum?.numValidMembers !== 'number'}
      />

      {(quorum?.previousConsecutiveDKGFailures || loading) &&
        <InfoLine
          title={'Previous DKG Failures'}
          value={quorum?.previousConsecutiveDKGFailures}
          loading={loading}
        />
      }

      <InfoLine
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
    </Popover>
  )
}
