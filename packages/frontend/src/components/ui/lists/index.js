import Link from 'next/link'
import './SimpleList.scss'
import { forwardRef } from 'react'
import { Container } from '@chakra-ui/react'
import ImageGenerator from '../../imageGenerator'
import ListColumnsHeader from './ListColumnsHeader'
import { Credits } from '../../../components/data'

function EmptyListMessage ({ children }) {
  return (
    <Container textAlign={'center'}>{children}</Container>
  )
}

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
        <div className={'SimpleListItem__TitlesContainer SimpleListItem__TitlesContainer--Mono'}>
          {item.monospaceTitles.map((title, key) =>
            <div className={'SimpleListItem__Title'} key={key}>{title}</div>
          )}
        </div>
      }

      {item.titles &&
        <div className={'SimpleListItem__TitlesContainer'}>
          {item.titles.map((title, key) =>
            <div className={'SimpleListItem__Title'} key={key}>{title}</div>
          )}
        </div>
      }

      {item.monospaceColumns &&
        <div className={'SimpleListItem__ColumnsContainer'}>
          {item.monospaceColumns.map((column, key) =>
            <div className={'SimpleListItem__Column SimpleListItem__Column--Monospace'} key={key}>{column}</div>
          )}
        </div>
      }

      {item.columns &&
        <div className={'SimpleListItem__ColumnsContainer'}>
          {item.columns.map((column, key) => {
            if (typeof column === 'object') {
              return (
                <div
                  key={key}
                  className={`SimpleListItem__Column ${
                      column?.mono && 'SimpleListItem__Column--Mono'
                    } ${
                      column?.dim && 'SimpleListItem__Column--Dim'
                    } ${
                      column?.ellipsis && 'SimpleListItem__Column--Ellipsis'
                    }`}
                >
                  {column?.avatar &&
                    <ImageGenerator
                      className={'SimpleListItem__Avatar'}
                      username={column.value}
                      lightness={50}
                      saturation={50}
                      width={15}
                      height={15}
                    />
                  }
                  {column?.numberFormat === 'currency'
                    ? <span><Credits>{column.value}</Credits></span>
                    : <span>{column.value}</span>
                  }
                </div>
              )
            }

            return <div className={'SimpleListItem__Column'} key={key}>{column}</div>
          })}
        </div>
      }
    </ItemContainer>
  )
}

const SimpleList = forwardRef(function (props, ref) {
  const { items, columns, showMoreLink } = props

  return (
    <div className={'SimpleList'} ref={ref}>
      {columns?.length > 0 &&
        <div className={'SimpleList__ColumnTitles'}>
          {columns.map((column, key) => {
            if (typeof column === 'object') {
              return (
                <div key={key} className={'SimpleList__ColumnTitle'}>{column.value}</div>
              )
            }

            return <div key={key} className={'SimpleList__ColumnTitle'}>{column}</div>
          }
          )}
        </div>
      }

      <div className={'SimpleList__List'}>
        {items.map((item, key) =>
          <SimpleListItem
            key={key}
            item={item}
          />
        )}
      </div>

      {showMoreLink &&
        <Link href={showMoreLink} className={'SimpleList__ShowMoreButton'}>Show more</Link>
      }
    </div>
  )
})

SimpleList.displayName = 'SimpleList'

export {
  SimpleList,
  EmptyListMessage,
  ListColumnsHeader
}
