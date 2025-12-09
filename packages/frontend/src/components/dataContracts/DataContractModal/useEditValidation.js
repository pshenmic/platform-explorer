import { useEffect, useState } from 'react'
import { checkPlatformExtension, ExtensionStatusEnum } from '../../../util/extension'

export const EditControlState = {
  INIT_INVALID: 'INIT_INVALID',
  USER_HAS_NO_EXTENSION: 'USER_HAS_NO_EXTENSION',
  USER_HAS_NO_WALLET: 'USER_HAS_NO_WALLET',
  VALID: 'VALID'
}


export const useEditValidation = ({ wallet }) => {
  const isExtensionConnected = checkPlatformExtension() === ExtensionStatusEnum.CONNECTED

  const [editValidateState, setEditValidate] = useState(EditControlState.INIT_INVALID)

  useEffect(() => {
    if (editValidateState === EditControlState.INIT_INVALID) {
      return
    }

    if (editValidateState === EditControlState.USER_HAS_NO_EXTENSION) {
      return
    }

    if (editValidateState === EditControlState.USER_HAS_NO_WALLET) {
      return
    }

  }, [wallet.currentIdentity, editValidateState, wallet?.walletInfo?.identities])

  useEffect(() => {
    if (!isExtensionConnected) {
      setEditValidate(EditControlState.USER_HAS_NO_EXTENSION)

      return
    }

    if (!wallet.connected.current) {
      setEditValidate(EditControlState.USER_HAS_NO_WALLET)
      wallet.connectWallet()

      return
    }

    setEditValidate(EditControlState.VALID)
  }, [wallet, isExtensionConnected])


  return { editValidateState, isEditVisible: editValidateState === EditControlState.VALID }
}