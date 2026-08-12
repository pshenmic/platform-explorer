import './SimpleList.css'
import './EmptyListMessage.css'
import Link from 'next/link'
import { forwardRef } from 'react'
import type { ComponentType, ReactNode, Ref } from 'react'
import { Container } from '@chakra-ui/react'
import ImageGenerator from '../../imageGenerator'
import ListColumnsHeader from './ListColumnsHeader'
// Untyped JS components — loose wrappers until data/* is migrated
import { BigNumber as BigNumberJs, Identifier as IdentifierJs, Alias as AliasJs } from '../../data'
import { RateTooltip } from '../Tooltips'
import type { Rate } from '../../../types'
import type { WithChildren } from '../../../types/common'

const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode, className?: string }>
const Identifier = IdentifierJs as ComponentType<{ children?: ReactNode, styles?: string[] }>
const Alias = AliasJs as ComponentType<{ children?: ReactNode, className?: string }>

function EmptyListMessage ({ children }: WithChildren) {
  return (
    <Container className={'EmptyListMessage'}>{children}</Container>
  )
}

interface ListColumn {
  value?: ReactNode
  format?: string
  mono?: boolean
  dim?: boolean
  ellipsis?: boolean
  avatar?: boolean
  avatarSource?: string
  rate?: Pick<Rate, 'usd'> | null
}

interface SimpleListItemData {
  link?: string
  monospaceTitles?: ReactNode[]
  titles?: ReactNode[]
  monospaceColumns?: ReactNode[]
  columns?: Array<ListColumn | ReactNode>
}

interface SimpleListItemProps {
  item: SimpleListItemData
}

function SimpleListItem ({ item }: SimpleListItemProps) {
  const ItemContainer = ({ link, children }: { link?: string, children?: ReactNode }) => link
    ? <Link href={link} className={'SimpleListItem'}>{children}</Link>
    : <div className={'SimpleListItem'}>{children}</div>

  const ValueContainer = ({ column, children }: { column: ListColumn, children?: ReactNode }) => {
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
    <ItemContainer link={item.link}>
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
            if (typeof column === 'object' && column !== null && !Array.isArray(column) && !('$$typeof' in (column as object))) {
              const col = column as ListColumn
              return (
                <div
                  key={key}
                  className={`SimpleListItem__Column ${
                      col?.mono ? 'SimpleListItem__Column--Mono' : ''
                    } ${
                      col?.dim ? 'SimpleListItem__Column--Dim' : ''
                    } ${
                      col?.ellipsis ? 'SimpleListItem__Column--Ellipsis' : ''
                    }`}
                >
                  {col?.avatar &&
                    <ImageGenerator
                      className={'SimpleListItem__Avatar'}
                      username={col.avatarSource || String(col.value ?? '')}
                      lightness={50}
                      saturation={50}
                      width={15}
                      height={15}
                    />
                  }
                  <ValueContainer column={col}>{col.value}</ValueContainer>
                </div>
              )
            }

            return <div className={'SimpleListItem__Column'} key={key}>{column as ReactNode}</div>
          })}
        </div>
      }
    </ItemContainer>
  )
}

interface SimpleListProps {
  items: SimpleListItemData[]
  columns?: Array<ListColumn | ReactNode>
  showMoreLink?: string
}

const SimpleList = forwardRef(function SimpleList (props: SimpleListProps, ref: Ref<HTMLDivElement>) {
  const { items, columns, showMoreLink } = props

  return (
    <div className={'SimpleList'} ref={ref}>
      {columns && columns.length > 0 &&
        <div className={'SimpleList__ColumnTitles'}>
          {columns.map((column, key) => {
            if (typeof column === 'object' && column !== null && !Array.isArray(column) && !('$$typeof' in (column as object))) {
              return (
                <div key={key} className={'SimpleList__ColumnTitle'}>{(column as ListColumn).value}</div>
              )
            }

            return <div key={key} className={'SimpleList__ColumnTitle'}>{column as ReactNode}</div>
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
