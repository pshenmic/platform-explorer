import DataListSkeleton from '../../components/ui/lists/DataList/DataListSkeleton'
import { columnLayout } from '../../components/tokens/TokensList.columns'

export default function Loading() {
  return (
    <div className={'ListPage Tokens'}>
      <div className={'InfoBlock'}>
        <DataListSkeleton
          title={'Tokens'}
          columns={Object.values(columnLayout).filter(column => column.key !== 'balance')}
        />
      </div>
    </div>
  )
}
