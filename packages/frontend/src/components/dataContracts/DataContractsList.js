import DataContractsListItem from './DataContractsListItem'
import { EmptyListMessage } from '../ui/lists'
import './DataContractsList.scss'

function DataContractsList ({ dataContracts = [], size = 'l' }) {
  return (
        <div className={'DataContractsList ' + 'DataContractsList--Size' + size.toUpperCase()}>
            {dataContracts.map((dataContract, key) =>
                <DataContractsListItem
                    key={key}
                    size={size}
                    dataContract={dataContract}
                />
            )}

            {dataContracts.length === 0 &&
                <EmptyListMessage>There are no data contracts created yet.</EmptyListMessage>
            }
        </div>
  )
}

export default DataContractsList
