import './DataList.css'

interface SkeletonColumn {
  key: string
  header: string
  minWidth?: number
  maxWidth?: number
  numeric?: boolean
  grow?: boolean
  align?: string
}

export default function DataListSkeleton({
  title,
  columns
}: {
  title: string
  columns: readonly SkeletonColumn[]
}) {
  return (
    <div
      className={'DataList DataList--fill DataList--loading DataList--routeLoading'}
      aria-busy={true}
      aria-label={`Loading ${title}`}
    >
      <div className={'DataList__FilterBar'}>
        <div className={'DataList__TitleRow'}>
          <h2 className={'DataList__Title'}>{title}</h2>
        </div>
      </div>
      <div className={'DataList__Scroll pe-QuietScroll'}>
        <table className={'DataList__Table'}>
          <thead className={'DataList__Head DataList__Head--default'}>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  scope={'col'}
                  className={`DataList__HeadCell DataList__HeadCell--${column.numeric ? 'right' : column.align || 'left'}`}
                  style={{ minWidth: column.minWidth }}
                >
                  <div className={'DataList__HeadCellInner'}>
                    <span className={'DataList__HeadCellTitle'}>{column.header}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={'DataList__Body'}>
            {Array.from({ length: 25 }, (_, index) => (
              <tr key={index} className={'DataList__Row DataList__Row--Skeleton'}>
                {columns.map(column => (
                  <td
                    key={column.key}
                    style={{ minWidth: column.minWidth }}
                    className={`DataList__Cell DataList__Cell--${column.numeric ? 'right' : column.align || 'left'}${column.numeric ? ' DataList__Cell--numeric' : ''}${column.grow ? ' DataList__Cell--grow' : ' DataList__Cell--compact'}`}
                  >
                    <div className={'DataList__CellContent'}>
                      <div style={{ maxWidth: column.maxWidth }}>
                        <span className={'DataList__Skeleton'} aria-hidden={true} />
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
