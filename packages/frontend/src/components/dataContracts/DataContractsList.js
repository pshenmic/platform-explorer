import DataContractsListItem from './DataContractsListItem'
import { EmptyListMessage } from '../ui/lists'
import './DataContractsList.scss'

function DataContractsList ({ dataContracts = [] }) {
  return (
    <div className={'DataContractsList'}>
      {dataContracts.map((dataContract, key) =>
        <DataContractsListItem dataContract={dataContract} key={key}/>
      )}

      {dataContracts.length === 0 &&
        <EmptyListMessage>There are no data contracts created yet.</EmptyListMessage>
      }
    </div>
  )
}

export default DataContractsList
