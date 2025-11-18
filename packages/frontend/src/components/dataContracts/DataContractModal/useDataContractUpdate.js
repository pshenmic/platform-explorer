import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useWalletConnect } from 'src/hooks'

const DOCUMENT_TYPE = 'posts'

const changeDataContract = async ({ identity, dataContractId, data }) => {
  console.log({ identity, dataContractId, data })
  const sdk = window.dashPlatformSDK

  // Get DocumentWASM from the network
  const [document] = await sdk.documents.query(
    dataContractId,
    DOCUMENT_TYPE,
    [['ownerId', '==', identity]] // or any other query
  )
    console.log({ document })

  // Get last identity contract nonce
  const identityContractNonce = await sdk.documents.query(
    ownerId,
    dataContractId
  ) // nonce

  // Turn it into StateTransitionWASM
  const stateTransition = await sdk.documents.createStateTransition(
    { ...document, ...data },
    'replace',
    identityContractNonce + 1n
  )

  // Broadcast transaction
  await sdk.stateTransitions.broadcast(stateTransition)
}

export const useDataContractUpdate = () => {
  const wallet = useWalletConnect()
  const { identifier } = useParams()

  useEffect(() => {
    wallet.connectWallet()
  }, [])

  const handleDataContractChange = (data) => {
    console.log({ data })
    console.log({ wallet })
    if (wallet.connected.current) {
      changeDataContract({
        identity: wallet.currentIdentity,
        dataContractId: identifier,
        data
      })
    }
  }

  return {
    handleDataContractChange
  }
}
