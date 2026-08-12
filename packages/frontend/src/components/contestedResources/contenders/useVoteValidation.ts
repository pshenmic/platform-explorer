import { useEffect, useState } from 'react'
import * as Api from '../../../util/Api'
import {
  checkPlatformExtension,
  ExtensionStatusEnum
} from '../../../util/extension'
import { useParams } from 'next/navigation'
import { API_VOTE_ENUM, VOTING_CAPABLE_TYPES } from './constants'
import type { VoteEnumValue } from './constants'
import type { WalletContextValue, WalletInfo } from 'src/contexts'

export const VoteControlState = {
  INIT_INVALID: 'INIT_INVALID',
  USER_HAS_NO_EXTENSION: 'USER_HAS_NO_EXTENSION',
  USER_HAS_NO_WALLET: 'USER_HAS_NO_WALLET',
  USER_IS_NOT_ALLOWED_TO_VOTE: 'USER_IS_NOT_ALLOWED_TO_VOTE',
  VOTING_IS_FINISHED: 'VOTING_IS_FINISHED',
  CAN_VOTE: 'CAN_VOTE'
} as const

export type VoteControlStateValue = (typeof VoteControlState)[keyof typeof VoteControlState]

const HIDDEN_STATES: VoteControlStateValue[] = [
  VoteControlState.INIT_INVALID,
  VoteControlState.VOTING_IS_FINISHED
]

interface UseVoteValidationParams {
  wallet: WalletContextValue
  isFinished?: boolean
}

interface IdentityWithType {
  identifier: string
  type?: string
  proTxHash?: string
}

const getLastVoteByProTxHash = ({
  resourceValue,
  proTxHash
}: {
  resourceValue: string
  proTxHash: string
}) => {
  const defaultOptions = {
    page: 1,
    size: 1,
    order: 'desc' as const
  }

  return Api.getContestedResourceVotes(
    resourceValue,
    defaultOptions.page,
    defaultOptions.size,
    defaultOptions.order,
    { pro_tx_hash: proTxHash }
  )
}

export const useVoteValidation = ({ wallet, isFinished }: UseVoteValidationParams) => {
  const proTxHash = wallet.walletInfo?.proTxHash
  const params = useParams()
  const resourceValue = typeof params?.resourceValue === 'string'
    ? params.resourceValue
    : Array.isArray(params?.resourceValue)
      ? params.resourceValue[0]
      : undefined
  const isExtensionConnected =
    checkPlatformExtension() === ExtensionStatusEnum.CONNECTED
  const [prevVote, setPrevVote] = useState<VoteEnumValue | null>(null)
  const [voteValidateState, setVoteValidate] = useState<VoteControlStateValue>(
    VoteControlState.INIT_INVALID
  )

  const identities = (wallet.walletInfo?.identities ?? []) as IdentityWithType[]
  const currentIdentityInfo = identities.find(
    ({ identifier }) => identifier === wallet.currentIdentity
  )
  const currentCanVote = VOTING_CAPABLE_TYPES.includes(
    currentIdentityInfo?.type as (typeof VOTING_CAPABLE_TYPES)[number]
  )

  useEffect(() => {
    if (isFinished) {
      setVoteValidate(VoteControlState.VOTING_IS_FINISHED)
      return
    }

    if (!isExtensionConnected) {
      setVoteValidate(VoteControlState.USER_HAS_NO_EXTENSION)
      return
    }

    if (!wallet.connected.current || !wallet.walletInfo) {
      setVoteValidate(VoteControlState.USER_HAS_NO_WALLET)
      return
    }

    if (!currentCanVote || !proTxHash) {
      setVoteValidate(VoteControlState.USER_IS_NOT_ALLOWED_TO_VOTE)
      return
    }

    setVoteValidate(VoteControlState.CAN_VOTE)
  }, [
    isFinished,
    isExtensionConnected,
    wallet,
    currentCanVote,
    proTxHash
  ])

  useEffect(() => {
    const getPrevVote = async () => {
      const info = wallet.walletInfo as WalletInfo | null
      if (!info?.proTxHash || !resourceValue) return

      try {
        const {
          resultSet: [prev]
        } = await getLastVoteByProTxHash({
          resourceValue,
          proTxHash: info.proTxHash
        })

        if (prev) {
          const choiceIndex = typeof prev.choice === 'number'
            ? prev.choice
            : Number(prev.choice)
          const choice = API_VOTE_ENUM[choiceIndex]

          setPrevVote(choice)
        }
      } catch (e) {
        console.log(e)
      }
    }

    if (wallet.walletInfo && voteValidateState === VoteControlState.CAN_VOTE) {
      getPrevVote()
    }
  }, [resourceValue, wallet, voteValidateState])

  return {
    voteValidateState,
    isVoteVisible: !HIDDEN_STATES.includes(voteValidateState),
    prevVote
  }
}
