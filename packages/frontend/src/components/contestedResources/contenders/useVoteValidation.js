import { useEffect, useState } from 'react'
import * as Api from '../../../util/Api'
import { checkPlatformExtension, ExtensionStatusEnum } from '../../../util/extension'
import { useParams } from 'next/navigation'
import { API_VOTE_ENUM } from './constants'

export const VoteControlState = {
  INIT_INVALID: 'INIT_INVALID',
  USER_HAS_NO_EXTENSION: 'USER_HAS_NO_EXTENSION',
  USER_HAS_NO_WALLET: 'USER_HAS_NO_WALLET',
  USER_IS_NOT_ALLOWED_TO_VOTE: 'USER_IS_NOT_ALLOWED_TO_VOTE',
  VOTING_IS_FINISHED: 'VOTING_IS_FINISHED',
  VALID: 'VALID'
}

const getLastVoteByProTxHash = ({ resourceValue, proTxHash }) => {
  const defaultOptions = {
    page: 1,
    size: 1,
    order: 'desc'
  }

  return Api.getContestedResourceVotes(resourceValue, defaultOptions.page, defaultOptions.size, defaultOptions.order, { pro_tx_hash: proTxHash })
}

export const useVoteValidation = ({ wallet, isFinished }) => {
  const { resourceValue } = useParams()
  const isExtensionConnected = checkPlatformExtension() === ExtensionStatusEnum.CONNECTED
  const [prevVote, setPrevVote] = useState(null)

  const [voteValidateState, setVoteValidate] = useState(VoteControlState.INIT_INVALID)
  const [isVotingAllowed, setVotingAllowed] = useState(false)

  useEffect(() => {
    const sdk = window.dashPlatformSDK
    const checkIdentity = async ({ identifier }) => {
      if (!wallet.currentIdentity) {
        return
      }

      try {
        const voterIdentity = await sdk.identities.getIdentityByIdentifier(identifier)
        const publicKeys = voterIdentity.getPublicKeys()
        const [publicKey] = publicKeys

        const isAllowed = publicKeys.length === 1 && publicKey.purpose === 'VOTING'

        if (isAllowed) {
          setVotingAllowed(isAllowed)
        }
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
  }, [wallet.currentIdentity, voteValidateState, wallet?.walletInfo?.identities])

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
      wallet.connectWallet()

      return
    }

    if (!isVotingAllowed) {
      setVoteValidate(VoteControlState.USER_IS_NOT_ALLOWED_TO_VOTE)

      return
    }

    setVoteValidate(VoteControlState.VALID)
  }, [isFinished, isVotingAllowed, wallet, isExtensionConnected])

  useEffect(() => {
    const getPrevVote = async () => {
      const { proTxHash } = wallet.walletInfo

      try {
        const { resultSet: [prev] } = await getLastVoteByProTxHash({ resourceValue, proTxHash })

        if (prev) {
          const choice = API_VOTE_ENUM[prev.choice]

          setPrevVote(choice)
        }
      } catch (e) {
        console.log(e)
      }
    }

    if (wallet.walletInfo && voteValidateState === VoteControlState.VALID) {
      getPrevVote()
    }
  }, [resourceValue, wallet, voteValidateState])

  return { voteValidateState, isVoteVisible: voteValidateState === VoteControlState.VALID, prevVote }
}
