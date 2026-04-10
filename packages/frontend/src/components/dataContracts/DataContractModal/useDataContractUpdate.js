import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useActiveNetwork, useWallet } from 'src/contexts'

const DOCUMENT_TYPE = 'dataContracts'

export const useDataContractUpdate = ({
  owner,
  defaultName,
  dataContractId
}) => {
  const sdk = window.dashPlatformSDK
  const signer = window.dashPlatformExtension?.signer
  const { connectWallet, connected } = useWallet()
  const [isDisabled, setDisabled] = useState(true)
  const { dataContractPE } = useActiveNetwork()
  const queryClient = useQueryClient()

  const handleChangeName = async (name) => {
    if (!connected.current) {
      await connectWallet()
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

      await new Promise((resolve) => setTimeout(resolve, 2000))

      queryClient.invalidateQueries({
        queryKey: ['dataContract']
      })
    } catch (e) {
      console.log(e)
    }
  }

  const handleChangeDescription = async ({ description, keywords }) => {
    if (!connected.current) {
      await connectWallet()
    }

    try {
      const dataContract =
        await sdk.dataContracts.getDataContractByIdentifier(dataContractId)
      const nonce = await sdk.identities.getIdentityContractNonce(
        owner,
        dataContractId
      )

      console.log({ keywords })

      dataContract.keywords = keywords
      dataContract.description = description
      dataContract.version = dataContract.version + 1

      const stateTransition = await sdk.dataContracts.createStateTransition(
        dataContract,
        'update',
        nonce + 1n
      )

      await signer.signAndBroadcast(stateTransition)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      queryClient.invalidateQueries({
        queryKey: ['dataContract']
      })
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    const validate = ({ identities }) => {
      const isValidIdentity = identities.some(
        ({ identifier }) => identifier === owner
      )

      const isDisabledEdit =
        defaultName && isValidIdentity && dataContractId !== dataContractPE

      setDisabled(isDisabledEdit)
    }
    connectWallet(validate)
  }, [])

  return {
    handleChangeName,
    handleChangeDescription,
    isDisabled
  }
}
