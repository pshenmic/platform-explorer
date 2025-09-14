import { useEffect, useState } from 'react'
import { ErrorMessageBlock } from '../../Errors'
import { LoadingList } from '../../loading'
import { EmptyListMessage } from '../../ui/lists'
import ContendersListItem from './ContendersListItem'

import { checkPlatformExtension, ExtensionStatusEnum } from '../../../util/extension'
import { useWalletConnect } from '../../../hooks/useWallet'

export const VoteControlState = {
  INIT_INVALID: 'INIT_INVALID',
  USER_HAS_NO_EXTANSION: 'USER_HAS_NO_EXTANSION',
  USER_HAS_NO_WALLET: 'USER_HAS_NO_WALLET',
  USER_HAS_NO_IDENTITY: 'USER_HAS_NO_IDENTITY',
  IT_IS_NOT_MASTER_NODE: 'IT_IS_NOT_MASTER_NODE',
  VALIDE: 'VALIDE'
}

export const ContendersContent = ({ contenders, loading, itemsCount = 10, ...props }) => {
  const wallet = useWalletConnect()
  const isExtensionConnected = checkPlatformExtension() === ExtensionStatusEnum.CONNECTED
  const [voteValidateState, setVoteValidate] = useState(VoteControlState.INIT_INVALID)

  useEffect(() => {
    if (!isExtensionConnected) {
      setVoteValidate(VoteControlState.USER_HAS_NO_EXTANSION)
    }

    if (!wallet.connected) {
      setVoteValidate(VoteControlState.USER_HAS_NO_WALLET)
    }
  }, [props.contenders, wallet.connected])

  if (loading) {
    return <LoadingList itemsCount={itemsCount} />
  }

  if (!contenders) {
    return <ErrorMessageBlock />
  }

  if (contenders.lenght === 0) {
    return <EmptyListMessage>There are no contenders</EmptyListMessage>
  }

  return (
    <>
        {contenders.map((contender) => (
            <ContendersListItem key={contender.identifier} contender={contender} {...wallet} {...props} />
        ))}
    </>
  )
}
