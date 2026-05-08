import { useModal } from '@components/ui/Modal'
import { useWallet } from 'src/contexts'
import { DataContractModal } from './DataContractModal'
import { useDataContractUpdate } from './DataContractModal/useDataContractUpdate'
import {
  EditControlState,
  useEditValidation
} from './DataContractModal/useEditValidation'

const withTitle = (Content) => {
  const Title = (props) => {
    if (!props.dataContract) {
      return null
    }
    return (
      <div className='DataContractTotalCard__TitleContainer'>
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
  const { editValidateState } = useEditValidation({
    wallet,
    ownerIdentifier: dataContract.owner.identifier
  })

  const { isOpen, handleOpen, handleClose } = useModal()

  const { handleChangeName, handleChangeDescription } = useDataContractUpdate({
    owner: dataContract.owner.identifier,
    dataContractId: dataContract.identifier,
    defaultName: dataContract.name
  })

  const handleDataContractChangeName = ({ name }) => {
    try {
      handleChangeName(name)
      handleClose()
    } catch (e) {
      console.log(e)
    }
  }

  const handleDataContractChangeDescription = ({ keywords, description }) => {
    try {
      handleChangeDescription({ keywords, description })
      handleClose()
    } catch (e) {
      console.log(e)
    }
  }

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
        <button
          className={'DataContractTotalCard__Edit'}
          onClick={handleOpen}
        >
          Edit
        </button>
        <DataContractModal
          isOpen={isOpen}
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
