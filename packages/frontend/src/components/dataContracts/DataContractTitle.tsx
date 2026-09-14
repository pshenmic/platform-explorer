import type { ComponentType } from 'react'
import { useModal } from '@components/ui/Modal'
import { useWallet } from 'src/contexts'
import { DataContractModal } from './DataContractModal'
import { useDataContractUpdate } from './DataContractModal/useDataContractUpdate'
import { EditControlState, useEditValidation } from './DataContractModal/useEditValidation'
import type { Owner } from '../../types'

/** Detail payload used by the title edit controls (owner may be enriched). */
interface DataContractTitleData {
  identifier: string
  name?: string | null
  description?: string | null
  keywords?: string[] | null
  owner: Owner | string
}

interface DataContractTitleProps {
  dataContract?: DataContractTitleData | null
}

const ownerIdentifier = (owner: Owner | string): string =>
  typeof owner === 'string' ? owner : owner.identifier

const withTitle = (Content: ComponentType<DataContractTitleProps>) => {
  const Title = (props: DataContractTitleProps) => {
    if (!props.dataContract) {
      return null
    }
    return (
      <div className="DataContractTotalCard__TitleContainer">
        <div className={'DataContractTotalCard__Title'}>
          {props.dataContract.name || (
            <span className={'DataContractTotalCard__NoName'}>No name</span>
          )}
        </div>
        <Content {...props} />
      </div>
    )
  }

  return Title
}

export const DataContractTitle = withTitle(({ dataContract }) => {
  const wallet = useWallet()
  const { connectWallet, isConnecting } = wallet
  const ownerId = dataContract ? ownerIdentifier(dataContract.owner) : ''
  const { editValidateState } = useEditValidation({
    wallet,
    ownerIdentifier: ownerId
  })

  const { isOpen, handleOpen, handleClose } = useModal()

  const { handleChangeName, handleChangeDescription } = useDataContractUpdate({
    owner: ownerId,
    dataContractId: dataContract?.identifier ?? ''
  })

  const handleDataContractChangeName = ({ name }: { name: string }) => {
    try {
      handleChangeName(name)
      handleClose()
    } catch (e) {
      console.log(e)
    }
  }

  const handleDataContractChangeDescription = ({
    keywords,
    description
  }: {
    keywords: string[]
    description: string
  }) => {
    try {
      handleChangeDescription({ keywords, description })
      handleClose()
    } catch (e) {
      console.log(e)
    }
  }

  if (!dataContract) return null

  if (editValidateState === EditControlState.USER_HAS_NO_WALLET) {
    return (
      <button
        className={'DataContractTotalCard__Edit'}
        onClick={() => connectWallet()}
        disabled={isConnecting}
      >
        Connect wallet
      </button>
    )
  }

  if (editValidateState === EditControlState.VALID) {
    return (
      <>
        <button className={'DataContractTotalCard__Edit'} onClick={handleOpen}>
          Edit
        </button>
        <DataContractModal
          isOpen={isOpen}
          defaultName={dataContract.name}
          defaultDescription={dataContract.description}
          defaultKeywords={dataContract.keywords}
          onChangeName={handleDataContractChangeName}
          onChangeDescription={handleDataContractChangeDescription}
        />
      </>
    )
  }

  return null
})
