import { useEffect, useState } from 'react'
import { useActiveNetwork } from 'src/contexts'
import { useWalletConnect } from 'src/hooks'

const DOCUMENT_TYPE = 'dataContracts'

export const useDataContractUpdate = ({
  owner,
  defaultName,
  dataContractId
}) => {
  const sdk = window.dashPlatformSDK
  const signer = window.dashPlatformExtension.signer
  const wallet = useWalletConnect()
  const [isDisabled, setDisabled] = useState(true)
  const { dataContractPE } = useActiveNetwork()

  const handleChangeName = async (name) => {
    if (!wallet.connected.current) {
      return
    }

    try {
      const dataContractsFields = {
        name,
        identifier: dataContractId
      }

      const document = await sdk.documents.create(
        dataContractPE,
        DOCUMENT_TYPE,
        dataContractsFields,
        owner
      )
      const nonce = await sdk.identities.getIdentityContractNonce(
        owner,
        dataContractPE
      )
      const params = { identityContractNonce: nonce + 1n }

      const stateTransition = await sdk.documents.createStateTransition(
        document,
        'create',
        params
      )
      await signer.signAndBroadcast(stateTransition)
    } catch (e) {
      console.log(e)
    }
  }

  const handleChangeDescription = async ({ description, keywords }) => {
    if (!wallet.connected.current) {
      return
    }

    try {
      const dataContract = await sdk.dataContracts.getDataContractByIdentifier(
        dataContractId
      )
      const nonce = await sdk.identities.getIdentityContractNonce(
        owner,
        dataContractId
      )

      dataContract.keywords = keywords
      dataContract.description = description

      const stateTransition = await sdk.dataContracts.createStateTransition(dataContract, 'update', nonce + 1n)

      await signer.signAndBroadcast(stateTransition)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    const validate = ({ identities }) => {
      const validIdentity = identities.find(
        ({ identifier }) => identifier === owner
      )

      const isDisabledEdit =
        defaultName && validIdentity !== -1 && dataContractId !== dataContractPE

      setDisabled(isDisabledEdit)
    }
    wallet.connectWallet(validate)
  }, [])

  return {
    handleChangeName,
    handleChangeDescription,
    isDisabled
  }
}
