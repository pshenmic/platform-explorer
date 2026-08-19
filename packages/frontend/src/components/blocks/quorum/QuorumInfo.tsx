import type { ComponentType, ReactNode } from 'react'
// Untyped JS components — loose wrappers until data/* is migrated
import { Identifier as IdentifierJs, InfoLine as InfoLineJs } from '../../data'
import { ValueContainer } from '../../ui/containers'
import { Badge } from '@chakra-ui/react'
import type { QuorumMember } from './QuorumMembersListItem'
import './QuorumInfo.css'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  styles?: string[]
  ellipsis?: boolean
  copyButton?: boolean
}>
const InfoLine = InfoLineJs as ComponentType<{
  className?: string
  title?: ReactNode
  value?: ReactNode
  loading?: boolean
  error?: boolean
}>

export interface QuorumInfoData {
  quorumHash?: string | null
  quorumIndex?: number | null
  type?: string | null
  blockHeight?: number | null
  creationHeight?: number | null
  minedBlockHash?: string | null
  numValidMembers?: number | null
  previousConsecutiveDKGFailures?: number | null
  healthRatio?: number | null
  members?: QuorumMember[] | null
}

interface QuorumInfoProps {
  quorum?: QuorumInfoData | null
  loading?: boolean
  l1explorerBaseUrl?: string
  showQuorumMembers?: () => void
}

export default function QuorumInfo({
  quorum,
  loading,
  l1explorerBaseUrl,
  showQuorumMembers
}: QuorumInfoProps) {
  return (
    <div className={'QuorumInfo'}>
      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'Quorum Hash'}
          value={
            <Identifier styles={['highlight-both']} ellipsis={false} copyButton={true}>
              {quorum?.quorumHash}
            </Identifier>
          }
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
              <Identifier styles={['highlight-both']} ellipsis={false}>
                {quorum?.minedBlockHash}
              </Identifier>
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
          value={
            typeof showQuorumMembers === 'function' ? (
              <ValueContainer size={'md'} clickable={true} light={true} onClick={showQuorumMembers}>
                {quorum?.numValidMembers}
              </ValueContainer>
            ) : (
              quorum?.numValidMembers
            )
          }
          loading={loading}
          error={typeof quorum?.numValidMembers !== 'number'}
        />
      </div>

      {typeof quorum?.previousConsecutiveDKGFailures === 'number' && (
        <div className={'QuorumInfo__LineContainer'}>
          <InfoLine
            className={'QuorumInfo__InfoLine'}
            title={'Previous DKG Failures'}
            value={
              <Badge colorScheme={quorum.previousConsecutiveDKGFailures > 0 ? 'red' : 'gray'}>
                {quorum.previousConsecutiveDKGFailures}
              </Badge>
            }
            loading={loading}
          />
        </div>
      )}

      <div className={'QuorumInfo__LineContainer'}>
        <InfoLine
          className={'QuorumInfo__InfoLine'}
          title={'Health Ratio'}
          value={
            <Badge
              colorScheme={(() => {
                if ((quorum?.healthRatio ?? 0) > 0.75) return 'green'
                if ((quorum?.healthRatio ?? 0) > 0.5) return 'yellow'
                if ((quorum?.healthRatio ?? 0) > 0.25) return 'orange'
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
