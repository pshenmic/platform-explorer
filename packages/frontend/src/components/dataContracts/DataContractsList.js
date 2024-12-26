import DataContractsListItem from './DataContractsListItem'
import { EmptyListMessage } from '../ui/lists'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import './DataContractsList.scss'

function DataContractsList ({ dataContracts = [], pagination, loading, itemsCount = 10 }) {
  return (
    <div className={'DataContractsList'}>
      {!loading
        ? <div className={'DataContractsList__Items'}>
            {dataContracts?.map((dataContract, key) =>
              <DataContractsListItem dataContract={dataContract} key={key}/>
            )}
            {dataContracts?.length === 0 &&
              <EmptyListMessage>There are no data contracts created yet.</EmptyListMessage>
            }
            {dataContracts === undefined && <ErrorMessageBlock/>}
          </div>
        : <LoadingList itemsCount={itemsCount}/>
      }

      {pagination &&
        <Pagination
          className={'DataContractsList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }
    </div>
  )
}

export default DataContractsList
