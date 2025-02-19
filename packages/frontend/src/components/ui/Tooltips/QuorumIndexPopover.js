import Tooltip from './Tooltip'
import { EpochTooltip, Popover } from './index'
import { DocumentIcon, InfoIcon } from '../icons'
import { Identifier, InfoLine } from '../../data'
import './QuorumIndexPopover.scss'

export default function QuorumIndexPopover ({ quorum, header, loading, children }) {
  console.log('quorum', quorum)

  return (
    <Popover className={'QuorumIndexPopover'} trigger={children} header={header}>
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
        value={quorum?.type}
        loading={loading}
        error={!quorum?.type}
      />

      {/*<InfoLine*/}
      {/*  title={'Quorum Block Height'}*/}
      {/*  value={''}*/}
      {/*  loading={loading}*/}
      {/*  error={false}*/}
      {/*/>*/}

      <InfoLine
        title={'Quorum Creation Height'}
        value={quorum?.creationHeight}
        loading={loading}
        error={typeof quorum?.creationHeight !== 'number'}
      />

      <InfoLine
        title={'Quorum Mined Block Hash'}
        value={quorum?.minedBlockHash}
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
        value={quorum?.healthRatio}
        loading={loading}
        error={quorum?.healthRatio === undefined || quorum?.healthRatio === null}
      />
    </Popover>
  )
}
