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

  const { handleChangeName, isDisabled } = useDataContractUpdate({
    owner: dataContract.owner.identifier,
    dataContractName: dataContract.name,
    dataContractId: dataContract.identifier
  })

  const handleDataContractUpdate = (data) => {
    try {
      handleChangeName(data)
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
        onClose={handleClose}
        onSubmit={handleDataContractUpdate}
      />
    </>
  )
})
