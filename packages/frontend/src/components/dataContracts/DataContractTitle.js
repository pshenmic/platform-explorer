import { useModal } from '@components/ui/Modal'
import { DataContractModal } from './DataContractModal'
import { useDataContractUpdate } from './DataContractModal/useDataContractUpdate'

const withTitle = (Content) => {
  const Title = (props) => {
    const { dataContract } = props

    if (!dataContract?.name) {
      return null
    }
    return (
      <div className='DataContractTotalCard__TitleContainer'>
        <div className={'DataContractTotalCard__Title'}>
          {dataContract.name}
        </div>
        <Content {...props} />
      </div>
    )
  }

  return Title
}

export const DataContractTitle = withTitle(({ dataContract }) => {
  const { isOpen, handleOpen, handleClose } = useModal()

  const { handleChangeName, handleChangeDescription, isDisabled } =
    useDataContractUpdate({
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

  if (!isDisabled) {
    return null
  }

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
        onChangeName={handleDataContractChangeName}
        onChangeDescription={handleDataContractChangeDescription}
      />
    </>
  )
})
