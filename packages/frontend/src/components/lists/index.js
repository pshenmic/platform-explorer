import Link from 'next/link'
import './SimpleList.scss'
import { forwardRef } from 'react'

function SimpleListItem ({ item }) {
  const ItemContainer = ({ link, children }) => link
    ? <Link href={link} className={'SimpleListItem'}>{children}</Link>
    : <div className={'SimpleListItem'}>{children}</div>

  return (
    <ItemContainer
        link={item.link}
        className={'SimpleListItem'}
    >
        {item.monospaceTitles &&
            <div className={'SimpleListItem__TitlesContainer SimpleListItem__TitlesContainer--Monospace'}>
                {item.monospaceTitles.map((title, key) =>
                    <div className={'SimpleListItem__Title'} key={key}>{ title }</div>
                )}
            </div>
        }

        {item.titles &&
            <div className={'SimpleListItem__TitlesContainer'}>
                {item.titles.map((title, key) =>
                    <div className={'SimpleListItem__Title'} key={key}>{ title }</div>
                )}
            </div>
        }

        {item.monospaceColumns &&
            <div className={'SimpleListItem__ColumnsContainer'}>
                {item.monospaceColumns.map((column, key) =>
                    <div className={'SimpleListItem__Column SimpleListItem__Column--Monospace'} key={key}>{ column }</div>
                )}
            </div>
        }

        {item.columns &&
            <div className={'SimpleListItem__ColumnsContainer'}>
                {item.columns.map((column, key) =>
                    <div className={'SimpleListItem__Column'} key={key}>{ column }</div>
                )}
            </div>
        }
    </ItemContainer>
  )
}

const SimpleList = forwardRef(function (props, ref) {
  const { items, columns } = props

  return (
    <div className={'SimpleList'} ref={ref}>
        <div className={'SimpleList__ColumnTitles'}>
            {columns.map((column, key) =>
                <div key={key} className={'SimpleList__ColumnTitle'}>{ column }</div>
            )}
        </div>

        <div>
            {items.map((item, key) =>
                <SimpleListItem
                    key={key}
                    item={item}
                />
            )}
        </div>
    </div>
  )
})

SimpleList.displayName = 'SimpleList'

const ListLoadingPreview = ({ itemsCount }) => {
  return (
    <div className={'SimpleList'}>
        {Array.from(Array(itemsCount)).map((e, i) => <div className={'SimpleListItem SimpleListItem--Loading'} key={i}>{i}</div>)}
    </div>
  )
}

export {
  SimpleList,
  ListLoadingPreview
}
