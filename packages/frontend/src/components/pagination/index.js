import './pagination.scss'

import ReactPaginate from 'react-paginate'

function Pagination ({ onPageChange, pageCount, forcePage }) {
  return (
        <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={onPageChange}
            pageRangeDisplayed={2}
            marginPagesDisplayed={1}
            pageCount={pageCount}
            previousLabel="<"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item page-item--previous"
            previousLinkClassName="page-link"
            nextClassName="page-item page-item--next"
            nextLinkClassName="page-link"
            breakClassName="page-item  page-item--break-link"
            containerClassName="pagination"
            activeClassName="active"
            renderOnZeroPageCount={true}
            forcePage={forcePage}
        />
  )
}

export default Pagination
