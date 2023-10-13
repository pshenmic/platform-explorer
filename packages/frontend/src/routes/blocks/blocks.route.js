import React, {useState} from 'react';
import {Link, useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './blocks.css'
import ReactPaginate from "react-paginate";

const blocksPerPage = 30;

function Blocks({blocks}) {
    return blocks.map((block) =>
        <div key={block.header.hash} className={"block_list_item"}>
            <Link to={`/block/${block.header.hash}`}>
                <span className={"block_list_item__height"}>{block.header.height} </span>
                <span className={"block_list_item__timestamp"}>{new Date(block.header.timestamp).toLocaleString()}</span>
                <span className={"block_list_item__hash"}>{block.header.hash}</span>
                <span className={"block_list_item__txs"}>({block.txs.length} txs)</span>
            </Link>
        </div>
    )
}

export async function loader() {
    const [status, paginatedBlocks] = await Promise.all([Api.getStatus(), Api.getBlocks(1, 30, 'desc')])

    const {blocksCount} = status
    const {resultSet} = paginatedBlocks

    return {blocks: resultSet, blocksCount};
}

function BlocksRoute() {
    const {blocks: defaultBlocks, blocksCount} = useLoaderData()
    const [blocks, setBlocks] = useState(defaultBlocks)

    const pageCount = Math.ceil(blocksCount / blocksPerPage)

    const handlePageClick = async ({selected}) => {
        const {resultSet} = await Api.getBlocks(selected+1, 30, 'desc')

        setBlocks(resultSet)
    }

    return (
        <div className="container">
            <div className={"block_list"}>
                <span className="block_list__title">Last blocks</span>

                <Blocks blocks={blocks}/>
                <ReactPaginate
                    breakLabel="..."
                    nextLabel=">"
                    onPageChange={handlePageClick}
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
                />
            </div>
        </div>
    );
}

export default BlocksRoute;
