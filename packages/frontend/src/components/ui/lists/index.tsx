import './SimpleList.css'
import './EmptyListMessage.css'
import Link from 'next/link'
import { forwardRef } from 'react'
import { Container } from '@chakra-ui/react'
import ImageGenerator from '../../imageGenerator'
import ListColumnsHeader from './ListColumnsHeader'
import DataList from './DataList/DataList'
import { BigNumber, Identifier, Alias } from '../../data'
import { RateTooltip } from '../Tooltips'
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from '../icons'

const placeIcons = {
  1: FirstPlaceIcon,
  2: SecondPlaceIcon,
  3: ThirdPlaceIcon
}

function EmptyListMessage ({ children }) {
  return (
    <Container className={'EmptyListMessage'}>{children}</Container>
  )
}

// fixed-width slot so rows 1–3 (medal) and 4–5 (#n) share the same left edge
function RankMark ({ place }) {
  if (place == null) return null
  const PlaceIcon = placeIcons[place]
  return (
    <span className={'SimpleListItem__Rank'}>
      {PlaceIcon
        ? <PlaceIcon className={'SimpleListItem__Medal'} aria-hidden={'true'}/>
        : <span className={'SimpleListItem__RankNum'} aria-hidden={'true'}>#{place}</span>}
    </span>
  )
}

function SimpleListItem ({ item }) {
  const place = item.place
  const rootClassName = [
    'SimpleListItem',
    place ? `SimpleListItem--Rank${place}` : ''
  ].filter(Boolean).join(' ')

  const ItemContainer = ({ link, className, children }) => link
    ? <Link href={link} className={className}>{children}</Link>
    : <div className={className}>{children}</div>

  const ValueContainer = ({ column, children }) => {
    if (column.format === 'currency') {
      const credits = Number(column.value)

      return (
        <RateTooltip credits={credits} rate={column?.rate}>
          <span>
            <BigNumber>{children}</BigNumber>
          </span>
        </RateTooltip>
      )
    }
    if (column.format === 'identifier') return <Identifier styles={['highlight-both']}>{children}</Identifier>
    if (column.format === 'alias') return <Alias>{children}</Alias>
    return <span>{children}</span>
  }

  return (
    <ItemContainer
      link={item.link}
      className={rootClassName}
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
              const isFirst = key === 0
              return (
                <div
                  key={key}
                  className={`SimpleListItem__Column ${
                      column?.mono ? 'SimpleListItem__Column--Mono' : ''
                    } ${
                      column?.dim ? 'SimpleListItem__Column--Dim' : ''
                    } ${
                      column?.ellipsis ? 'SimpleListItem__Column--Ellipsis' : ''
                    }`}
                >
                  {isFirst && <RankMark place={place}/>}
                  {column?.avatar &&
                    <ImageGenerator
                      className={'SimpleListItem__Avatar'}
                      username={column.avatarSource || column.value}
                      lightness={50}
                      saturation={50}
                      width={15}
                      height={15}
                    />
                  }
                  <ValueContainer column={column} format={column?.format}>{column.value}</ValueContainer>
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
  ListColumnsHeader,
  DataList
}
