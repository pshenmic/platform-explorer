import { Tooltip } from '../../ui/Tooltips'
import { PrimalPostitiveIcon, PrimalNegativeIcon, CloseIcon } from '../../ui/icons'
import { VoteEnum } from './constants'
import type { VoteEnumValue } from './constants'
import type { WalletInfo } from 'src/contexts'

import './VoteControls.css'
import { useState, useEffect } from 'react'

const VOTING_DATA_CONTRACT_ID =
  process.env.NEXT_PUBLIC_VOTING_DATA_CONTRACT_ID ?? 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec'
const DOCUMENT_TYPE = 'domain'
const INDEX_NAME = 'parentNameAndLabel'

interface VotingSdk {
  identities: {
    getIdentityByIdentifier: (id: string) => Promise<{ id: string }>
    getIdentityNonce: (id: string) => Promise<bigint>
  }
  voting: {
    createVote: (
      dataContractId: string,
      documentType: string,
      indexName: string,
      resourceValue: string[] | unknown,
      choice: string
    ) => unknown
    createStateTransition: (
      vote: unknown,
      proTxHash: string | undefined,
      voterId: string,
      nonce: bigint
    ) => unknown
  }
}

interface VoteControlsProps {
  currentIdentity?: string | null
  contender?: string
  resourceValue?: string[] | unknown
  walletInfo?: WalletInfo | null
  prevVote?: VoteEnumValue | null
  refresh?: () => void
  isPollingAfterVote?: boolean
  isDisabled?: boolean
  disabledTooltip?: string
}

export const VoteControls = ({
  currentIdentity,
  contender,
  resourceValue,
  walletInfo,
  prevVote,
  refresh,
  isPollingAfterVote,
  isDisabled = false,
  disabledTooltip
}: VoteControlsProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [activeChoice, setActiveChoice] = useState<string | null>(null)

  useEffect(() => {
    if (!isPollingAfterVote) {
      setIsLoading(false)
      setActiveChoice(null)
    }
  }, [isPollingAfterVote])

  const castVote = async ({ choice }: { choice: string }) => {
    if (!window.dashPlatformExtension || !currentIdentity) return

    setActiveChoice(choice)
    setIsLoading(true)
    try {
      const sdk = window.dashPlatformSDK as unknown as VotingSdk
      const voterIdentity = await sdk.identities.getIdentityByIdentifier(currentIdentity)
      const identityNonce = await sdk.identities.getIdentityNonce(voterIdentity.id)
      const { proTxHash } = walletInfo ?? {}

      const vote = sdk.voting.createVote(
        VOTING_DATA_CONTRACT_ID,
        DOCUMENT_TYPE,
        INDEX_NAME,
        resourceValue,
        choice
      )
      const stateTransition = sdk.voting.createStateTransition(
        vote,
        proTxHash,
        voterIdentity.id,
        identityNonce + BigInt(1)
      )

      await (
        window.dashPlatformExtension.signer.signAndBroadcast as (st: unknown) => Promise<unknown>
      )(stateTransition)

      refresh?.()
    } catch (e) {
      console.error(e)
      setIsLoading(false)
    }
  }

  const buttonDisabled = isDisabled || isLoading

  const showTooltip = isDisabled && !!disabledTooltip

  return (
    <Tooltip isDisabled={!showTooltip} label={disabledTooltip}>
      <div className="VoteControls">
        <button
          type={'button'}
          className={'VoteControls__Button VoteControls__Button--Approve'}
          disabled={buttonDisabled || prevVote === VoteEnum.TO_APPROVE}
          aria-label="vote"
          onClick={() => contender && castVote({ choice: contender })}
        >
          <PrimalPostitiveIcon width="18px" height="10px" />
        </button>
        <button
          type={'button'}
          className={'VoteControls__Button VoteControls__Button--Abstain'}
          disabled={buttonDisabled || prevVote === VoteEnum.TO_ABSTAIN}
          aria-label="vote"
          onClick={() => castVote({ choice: VoteEnum.TO_ABSTAIN })}
        >
          <PrimalNegativeIcon width="11px" height="10px" />
        </button>
        <button
          type={'button'}
          className={'VoteControls__Button VoteControls__Button--Reject'}
          disabled={buttonDisabled || prevVote === VoteEnum.TO_REJECT}
          aria-label="vote"
          onClick={() => castVote({ choice: VoteEnum.TO_REJECT })}
        >
          <CloseIcon width="8px" height="8px" />
        </button>
      </div>
    </Tooltip>
  )
}
