import { MethodSelect as SharedMethodSelect } from 'src/components/signing'
import { useDeploy } from '../../DeployContext'

export const MethodSelect = () => {
  const { signer } = useDeploy()
  return (
    <SharedMethodSelect
      value={signer.method}
      onChange={signer.setMethod}
      isDisabled={signer.isConnecting}
    />
  )
}
