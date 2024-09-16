import './pagination.scss'

import ReactPaginate from 'react-paginate'

function Pagination ({ onPageChange, pageCount, forcePage }) {
  pageCount = Math.max(pageCount, 1)

  return (
    <ReactPaginate
      breakLabel={'...'}
      nextLabel={'>'}
      onPageChange={onPageChange}
      pageRangeDisplayed={2}
      marginPagesDisplayed={1}
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
      containerClassName={'Pagination'}
      activeClassName={'active'}
      renderOnZeroPageCount={true}
      forcePage={forcePage}
    />
  )
}

export default Pagination
