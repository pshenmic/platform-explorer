import { useEffect, useState } from 'react'

import { checkPlatformExtension, ExtensionStatusEnum } from '../../../util/extension'

export const VoteControlState = {
  INIT_INVALID: 'INIT_INVALID',
  USER_HAS_NO_EXTANSION: 'USER_HAS_NO_EXTANSION',
  USER_HAS_NO_WALLET: 'USER_HAS_NO_WALLET',
  USER_IS_NOT_ALLOWED_TO_VOTING: 'USER_IS_NOT_ALLOWED_TO_VOTING',
  VOTING_IS_FINISHED: 'VOTING_IS_FINISHED',
  VALIDE: 'VALIDE'
}

export const useVoteValidation = ({ wallet, isFinished }) => {
  const isExtensionConnected = checkPlatformExtension() === ExtensionStatusEnum.CONNECTED

  const [voteValidateState, setVoteValidate] = useState(VoteControlState.INIT_INVALID)
  const [isVotingAllowed, setVotingAllowed] = useState(false)

  useEffect(() => {
    const sdk = window.dashPlatformSDK

    const checkIdentity = async () => {
      if (!wallet.currentIdentity) {
        return
      }

      try {
        const voterIdentity = await sdk.identities.getIdentityByIdentifier(wallet.currentIdentity)
        const publicKeys = voterIdentity.getPublicKeys()
        const [publicKey] = publicKeys

        const isAllowed = publicKeys.length === 1 && publicKey.purpose === 'VOTING'

        setVotingAllowed(isAllowed)
      } catch (e) {
        console.error(e)
      }
    }

    checkIdentity()
  }, [wallet.currentIdentity])

  useEffect(() => {
    if (isFinished) {
      setVoteValidate(VoteControlState.VOTING_IS_FINISHED)

      return
    }

    wallet.connectWallet()

    if (!isExtensionConnected) {
      setVoteValidate(VoteControlState.USER_HAS_NO_EXTANSION)

      return
    }

    if (!wallet.connected) {
      setVoteValidate(VoteControlState.USER_HAS_NO_WALLET)

      return
    }

    if (!isVotingAllowed) {
      setVoteValidate(VoteControlState.USER_IS_NOT_ALLOWED_TO_VOTING)

      return
    }

    setVoteValidate(VoteControlState.VALIDE)
  }, [isFinished, wallet.connected, isVotingAllowed, wallet, isExtensionConnected])

  return { voteValidateState, isVoteVisible: voteValidateState === VoteControlState.VALIDE }
}
