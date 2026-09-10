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

// Minimal SDK surface used by this hook (extension-injected window.dashPlatformSDK).
interface DataContractSdkShape {
  keywords?: string[]
  description?: string
  version: number
}

interface DashPlatformSdkDocuments {
  create: (
    dataContractId: string | undefined,
    documentType: string,
    fields: Record<string, unknown>,
    owner: string
  ) => Promise<unknown>
  createStateTransition: (
    document: unknown,
    action: string,
    params: { identityContractNonce: bigint }
  ) => Promise<{ base64: () => string }>
}

interface DashPlatformSdkDataContracts {
  getDataContractByIdentifier: (id: string) => Promise<DataContractSdkShape>
  createStateTransition: (
    dataContract: DataContractSdkShape,
    action: string,
    nonce: bigint
  ) => Promise<{ base64: () => string }>
}

interface DashPlatformSdkIdentities {
  getIdentityContractNonce: (owner: string, dataContractId: string | undefined) => Promise<bigint>
}

interface DataContractUpdateSdk {
  documents: DashPlatformSdkDocuments
  dataContracts: DashPlatformSdkDataContracts
  identities: DashPlatformSdkIdentities
}

interface ExtensionSigner {
  signAndBroadcast: (base64: string) => Promise<unknown>
}

export const useDataContractUpdate = ({ owner, dataContractId }: UseDataContractUpdateParams) => {
  // Cast: window.dashPlatformSDK is declared minimally elsewhere; this hook needs a wider surface.
  const sdk = window.dashPlatformSDK as unknown as DataContractUpdateSdk | undefined
  const signer = window.dashPlatformExtension?.signer as ExtensionSigner | undefined
  const { connectWallet, connected } = useWallet()
  const { dataContractPE } = useActiveNetwork()
  const queryClient = useQueryClient()

  const handleChangeName = async (name: string) => {
    if (!connected.current) {
      await connectWallet()
    }

    if (!sdk || !signer) return

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
      const nonce = await sdk.identities.getIdentityContractNonce(owner, dataContractPE)
      const params = { identityContractNonce: nonce + 1n }

      const stateTransition = await sdk.documents.createStateTransition(document, 'create', params)
      // base64, not the raw WASM object — the extension runs a separate wasm and can't unwrap it.
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
      await connectWallet()
    }

    if (!sdk || !signer) return

    try {
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
