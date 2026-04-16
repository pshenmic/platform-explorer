import { useEffect, useState } from 'react'
import * as Api from '../../../util/Api'
import {
  checkPlatformExtension,
  ExtensionStatusEnum
} from '../../../util/extension'
import { useParams } from 'next/navigation'
import { API_VOTE_ENUM } from './constants'

export const VoteControlState = {
  INIT_INVALID: 'INIT_INVALID',
  USER_HAS_NO_EXTENSION: 'USER_HAS_NO_EXTENSION',
  USER_HAS_NO_WALLET: 'USER_HAS_NO_WALLET',
  USER_IS_NOT_ALLOWED_TO_VOTE: 'USER_IS_NOT_ALLOWED_TO_VOTE',
  VOTING_IS_FINISHED: 'VOTING_IS_FINISHED',
  CAN_VOTE: 'CAN_VOTE'
}

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
  const [isVotingAllowed, setVotingAllowed] = useState(false)

  useEffect(() => {
    const sdk = window.dashPlatformSDK
    const checkIdentity = async ({ identifier }) => {
      if (!wallet.currentIdentity) {
        return
      }

      try {
        const voterIdentity =
          await sdk.identities.getIdentityByIdentifier(identifier)
        if (!voterIdentity) return

        const publicKeys = voterIdentity.getPublicKeys() ?? []
        if (publicKeys.length !== 1) return

        const [publicKey] = publicKeys
        if (publicKey?.purpose !== 'VOTING') return

        setVotingAllowed(true)
      } catch (e) {
        console.error(e)
      }
    }

    if (voteValidateState === VoteControlState.INIT_INVALID) {
      return
    }

    if (voteValidateState === VoteControlState.USER_HAS_NO_EXTENSION) {
      return
    }

    if (voteValidateState === VoteControlState.USER_HAS_NO_WALLET) {
      return
    }

    if (voteValidateState === VoteControlState.VOTING_IS_FINISHED) {
      return
    }

    if (wallet?.walletInfo?.identities) {
      wallet?.walletInfo.identities.forEach(checkIdentity)
    }
  }, [
    wallet.currentIdentity,
    voteValidateState,
    wallet?.walletInfo?.identities
  ])

  useEffect(() => {
    if (isFinished) {
      setVoteValidate(VoteControlState.VOTING_IS_FINISHED)

      return
    }

    if (!isExtensionConnected) {
      setVoteValidate(VoteControlState.USER_HAS_NO_EXTENSION)

      return
    }

    if (!wallet.connected.current) {
      setVoteValidate(VoteControlState.USER_HAS_NO_WALLET)

      return
    }

    if (!isVotingAllowed || !proTxHash) {
      setVoteValidate(VoteControlState.USER_IS_NOT_ALLOWED_TO_VOTE)

      return
    }

    setVoteValidate(VoteControlState.CAN_VOTE)
  }, [isFinished, isVotingAllowed, wallet, isExtensionConnected, proTxHash])

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
    isVoteVisible:
      voteValidateState === VoteControlState.CAN_VOTE ||
      voteValidateState === VoteControlState.USER_HAS_NO_WALLET,
    prevVote
  }
}
