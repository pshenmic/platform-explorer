import './Pagination.css'

import ReactPaginate from 'react-paginate'
import type { ComponentType, ReactNode } from 'react'
import { ChevronIcon } from '../ui/icons'
import type { WithClassName } from '../../types/common'

interface PageChangeEvent {
  selected: number
}

interface ReactPaginateProps {
  breakLabel?: ReactNode
  nextLabel?: ReactNode
  previousLabel?: ReactNode
  onPageChange?: (event: PageChangeEvent) => void
  pageRangeDisplayed?: number
  marginPagesDisplayed?: number
  pageCount: number
  pageClassName?: string
  pageLinkClassName?: string
  previousClassName?: string
  previousLinkClassName?: string
  nextClassName?: string
  nextLinkClassName?: string
  breakClassName?: string
  breakLinkClassName?: string
  containerClassName?: string
  activeClassName?: string
  // library types expect a render fn; runtime accepts boolean
  renderOnZeroPageCount?: boolean | null | (() => void)
  forcePage?: number
}

// react-paginate ships without TypeScript types
const Paginate = ReactPaginate as unknown as ComponentType<ReactPaginateProps>

interface PaginationProps extends WithClassName {
  onPageChange?: (event: PageChangeEvent) => void
  pageCount: number
  forcePage?: number
  pageRangeDisplayed?: number
  marginPagesDisplayed?: number
  justify?: boolean
}

function Pagination({
  onPageChange,
  pageCount,
  forcePage,
  pageRangeDisplayed = 2,
  marginPagesDisplayed = 1,
  justify = false,
  className
}: PaginationProps) {
  const count = Math.max(pageCount, 1)

  return (
    <Paginate
      breakLabel={'...'}
      nextLabel={<ChevronIcon color={'gray.250'} />}
      onPageChange={onPageChange}
      pageRangeDisplayed={pageRangeDisplayed}
      marginPagesDisplayed={marginPagesDisplayed}
      pageCount={count}
      previousLabel={<ChevronIcon color={'gray.250'} />}
      pageClassName={'PageItem'}
      pageLinkClassName={'PageLink'}
      previousClassName={'PageItem PageItem--Previous'}
      previousLinkClassName={'PageLink'}
      nextClassName={'PageItem PageItem--Next'}
      nextLinkClassName={'PageLink'}
      breakClassName={'PageItem PageItem--BreakLink'}
      breakLinkClassName={'PageLink PageLink--Break'}
      containerClassName={`Pagination ${className || ''} ${justify ? 'Pagination--Justify' : ''}`}
      activeClassName={'active'}
      renderOnZeroPageCount={true}
      forcePage={forcePage}
    />
  )
}

export default Pagination
