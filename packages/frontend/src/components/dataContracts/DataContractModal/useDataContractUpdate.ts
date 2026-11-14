import { useQueryClient } from '@tanstack/react-query'
import { useActiveNetwork, useWallet } from 'src/contexts'

const DOCUMENT_TYPE = 'dataContracts'

interface UseDataContractUpdateParams {
  owner: string
  dataContractId: string
}

interface DescriptionUpdate {
  description?: string
  keywords?: string[]
}

export const useDataContractUpdate = ({ owner, dataContractId }: UseDataContractUpdateParams) => {
  const { connectWallet, connected, getSDK } = useWallet()
  const { dataContractPE } = useActiveNetwork()
  const queryClient = useQueryClient()

  const handleChangeName = async (name: string) => {
    if (!connected.current) {
      if (!(await connectWallet())) return
    }

    const signer = window.dashPlatformExtension?.signer
    if (!signer) return

    try {
      const sdk = await getSDK()
      if (!dataContractPE) throw new Error('Explorer data contract is not configured')
      const dataContractsFields = {
        name,
        identifier: dataContractId
      }
      const nonce = await sdk.identities.getIdentityContractNonce(owner, dataContractPE)
      const params = { identityContractNonce: nonce + 1n }

      const document = sdk.documents.create(
        dataContractPE,
        DOCUMENT_TYPE,
        dataContractsFields,
        owner,
        params.identityContractNonce
      )

      const stateTransition = sdk.documents.createStateTransition(document, 'create', params)
      await signer.signAndBroadcast(stateTransition.base64())

      await new Promise(resolve => setTimeout(resolve, 2000))

      queryClient.invalidateQueries({
        queryKey: ['dataContract']
      })
    } catch (e) {
      console.log(e)
    }
  }

  const handleChangeDescription = async ({ description, keywords }: DescriptionUpdate) => {
    if (!connected.current) {
      if (!(await connectWallet())) return
    }

    const signer = window.dashPlatformExtension?.signer
    if (!signer) return

    try {
      const sdk = await getSDK()
      const dataContract = await sdk.dataContracts.getDataContractByIdentifier(dataContractId)
      const nonce = await sdk.identities.getIdentityContractNonce(owner, dataContractId)

      if (Array.isArray(keywords)) {
        dataContract.keywords = keywords
      }
      if (description?.trim()) {
        dataContract.description = description
      }
      dataContract.version = dataContract.version + 1

      const stateTransition = await sdk.dataContracts.createStateTransition(
        dataContract,
        'update',
        nonce + 1n
      )

      await signer.signAndBroadcast(stateTransition.base64())

      await new Promise(resolve => setTimeout(resolve, 2000))

      queryClient.invalidateQueries({
        queryKey: ['dataContract']
      })
    } catch (e) {
      console.log(e)
    }
  }

  return {
    handleChangeName,
    handleChangeDescription
  }
}
