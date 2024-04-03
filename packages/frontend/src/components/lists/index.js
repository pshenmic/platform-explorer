import Link from 'next/link'
import './SimpleList.scss'

function SimpleListItem ({ item }) {
    const ItemContainer = ({ link, children }) => link ? 
        <Link className={'SimpleListItem'}>{children}</Link> : 
        <div className={'SimpleListItem'}>{children}</div>

    return (
        <ItemContainer
            link={item.link} 
            className={'SimpleListItem'}
        >
            {item.monospaceTitles &&
                <div className={'SimpleListItem__TitlesContainer SimpleListItem__TitlesContainer--Monospace'}>
                    {item.monospaceTitles.map((title, key) =>
                        <div className={'SimpleListItem__ColumnTitle'} key={key}>{ title }</div>
                    )}
                </div>
            }

            {item.titles &&
                <div className={'SimpleListItem__TitlesContainer'}>
                    {item.titles.map((title, key) =>
                        <div className={'SimpleListItem__ColumnTitle'} key={key}>{ title }</div>
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

function SimpleList({ items, columns = [] }) {
    return (
        <div className={'SimpleList'}>

            <div className={'SimpleList__ColumnTitles'}>
                {columns.map((column, key) =>
                    <div key={key} className={'SimpleList__ColumnTitle'}>{ column }</div>
                )}
            </div>

            {items.map((item, key) =>
                <SimpleListItem
                    key={key}
                    item={item}
                />
            )}
        </div>
    )
}

export {SimpleList}