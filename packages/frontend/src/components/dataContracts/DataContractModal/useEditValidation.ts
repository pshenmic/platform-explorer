import { useEffect, useState } from 'react'
import {
  checkPlatformExtension,
  ExtensionStatusEnum
} from '../../../util/extension'
import type { WalletContextValue } from 'src/contexts'

export const EditControlState = {
  INIT_INVALID: 'INIT_INVALID',
  USER_HAS_NO_EXTENSION: 'USER_HAS_NO_EXTENSION',
  USER_HAS_NO_WALLET: 'USER_HAS_NO_WALLET',
  USER_IS_NOT_OWNER: 'USER_IS_NOT_OWNER',
  VALID: 'VALID'
} as const

export type EditControlStateValue = (typeof EditControlState)[keyof typeof EditControlState]

const VISIBLE_STATES: EditControlStateValue[] = [
  EditControlState.USER_HAS_NO_WALLET,
  EditControlState.VALID
]

interface UseEditValidationParams {
  wallet: WalletContextValue
  ownerIdentifier: string | null | undefined
}

export const useEditValidation = ({ wallet, ownerIdentifier }: UseEditValidationParams) => {
  const isExtensionConnected =
    checkPlatformExtension() === ExtensionStatusEnum.CONNECTED

  const [editValidateState, setEditValidate] = useState<EditControlStateValue>(
    EditControlState.INIT_INVALID
  )

  useEffect(() => {
    if (!isExtensionConnected) {
      setEditValidate(EditControlState.USER_HAS_NO_EXTENSION)
      return
    }

    if (!wallet.connected.current || !wallet.walletInfo) {
      setEditValidate(EditControlState.USER_HAS_NO_WALLET)
      return
    }

    const isOwner = (wallet.walletInfo?.identities ?? []).some(
      ({ identifier }) => identifier === ownerIdentifier
    )

    if (!isOwner) {
      setEditValidate(EditControlState.USER_IS_NOT_OWNER)
      return
    }

    setEditValidate(EditControlState.VALID)
  }, [isExtensionConnected, wallet, ownerIdentifier])

  return {
    editValidateState,
    isEditVisible: VISIBLE_STATES.includes(editValidateState)
  }
}
