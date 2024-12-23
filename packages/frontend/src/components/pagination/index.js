import './Pagination.scss'

import ReactPaginate from 'react-paginate'

function Pagination ({
  onPageChange,
  pageCount,
  forcePage,
  pageRangeDisplayed = 2,
  marginPagesDisplayed = 1,
  justify = false,
  className
}) {
  pageCount = Math.max(pageCount, 1)

  return (
    <ReactPaginate
      breakLabel={'...'}
      nextLabel={'>'}
      onPageChange={onPageChange}
      pageRangeDisplayed={pageRangeDisplayed}
      marginPagesDisplayed={marginPagesDisplayed}
      pageCount={pageCount}
      previousLabel={'<'}
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
