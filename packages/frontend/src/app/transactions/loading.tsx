import DataListSkeleton from '../../components/ui/lists/DataList/DataListSkeleton'
import { columnLayout } from '../../components/transactions/TransactionsList.columns'

export default function Loading() {
  return (
    <div className={'ListPage Transactions'}>
      <div className={'InfoBlock'}>
        <DataListSkeleton title={'Transactions'} columns={Object.values(columnLayout)} />
      </div>
    </div>
  )
}
