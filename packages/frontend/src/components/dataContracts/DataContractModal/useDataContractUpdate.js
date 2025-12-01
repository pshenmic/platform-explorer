import { useEffect, useState } from 'react'
import { useActiveNetwork } from 'src/contexts'
import { useWalletConnect } from 'src/hooks'

const DOCUMENT_TYPE = 'dataContracts'

const changeDataContract = async ({
  owner,
  dataContractId,
  name,
  dataContractPE
}) => {
  const sdk = window.dashPlatformSDK
  const extension = window.dashPlatformExtension
  const document = await sdk.documents.create(
    dataContractPE,
    DOCUMENT_TYPE,
    {
      name,
      identifier: dataContractId
    },
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
  await extension.signer.signAndBroadcast(stateTransition)
}

export const useDataContractUpdate = ({
  owner,
  dataContractName,
  dataContractId
}) => {
  const wallet = useWalletConnect()
  const [isDisabled, setDisabled] = useState(true)
  const { dataContractPE } = useActiveNetwork()

  useEffect(() => {
    const validate = ({ identities }) => {
      const validIdentity = identities.find(
        ({ identifier }) => identifier === owner
      )

      const isDisabledEdit =
        dataContractName &&
        validIdentity !== -1 &&
        dataContractId !== dataContractPE

      setDisabled(isDisabledEdit)
    }
    wallet.connectWallet(validate)
  }, [])

  const handleChangeName = (data) => {
    if (wallet.connected.current) {
      changeDataContract({
        owner,
        name: data.name,
        dataContractId,
        dataContractPE
      })
    }
  }

  return {
    handleChangeName,
    isDisabled
  }
}
