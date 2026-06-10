import { useEffect, useState } from 'react'
import * as Api from '../../../util/Api'
import {
  checkPlatformExtension,
  ExtensionStatusEnum
} from '../../../util/extension'
import { useParams } from 'next/navigation'
import { API_VOTE_ENUM, VOTING_CAPABLE_TYPES } from './constants'

export const VoteControlState = {
  INIT_INVALID: 'INIT_INVALID',
  USER_HAS_NO_EXTENSION: 'USER_HAS_NO_EXTENSION',
  USER_HAS_NO_WALLET: 'USER_HAS_NO_WALLET',
  USER_IS_NOT_ALLOWED_TO_VOTE: 'USER_IS_NOT_ALLOWED_TO_VOTE',
  VOTING_IS_FINISHED: 'VOTING_IS_FINISHED',
  CAN_VOTE: 'CAN_VOTE'
}

const HIDDEN_STATES = [
  VoteControlState.INIT_INVALID,
  VoteControlState.VOTING_IS_FINISHED
]

const getLastVoteByProTxHash = ({ resourceValue, proTxHash }) => {
  const defaultOptions = {
    page: 1,
    size: 1,
    order: 'desc'
  }

  return Api.getContestedResourceVotes(
    resourceValue,
    defaultOptions.page,
    defaultOptions.size,
    defaultOptions.order,
    { pro_tx_hash: proTxHash }
  )
}

export const useVoteValidation = ({ wallet, isFinished }) => {
  const proTxHash = wallet.walletInfo?.proTxHash
  const { resourceValue } = useParams()
  const isExtensionConnected =
    checkPlatformExtension() === ExtensionStatusEnum.CONNECTED
  const [prevVote, setPrevVote] = useState(null)
  const [voteValidateState, setVoteValidate] = useState(
    VoteControlState.INIT_INVALID
  )

  const identities = wallet.walletInfo?.identities ?? []
  const currentIdentityInfo = identities.find(
    ({ identifier }) => identifier === wallet.currentIdentity
  )
  const currentCanVote = VOTING_CAPABLE_TYPES.includes(
    currentIdentityInfo?.type
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
      const { proTxHash } = wallet.walletInfo

      try {
        const {
          resultSet: [prev]
        } = await getLastVoteByProTxHash({ resourceValue, proTxHash })

        if (prev) {
          const choice = API_VOTE_ENUM[prev.choice]

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
