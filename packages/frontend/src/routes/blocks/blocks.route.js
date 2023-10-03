import React, {useState} from 'react';
import {Link, useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './blocks.css'
import ReactPaginate from "react-paginate";

const blocksPerPage = 30;

function Blocks({blocks}) {
    return blocks.map((block) =>
        <div key={block.header.hash} className={"block_list_item"}>
            <span>{block.header.height} </span>
            <Link to={`/block/${block.header.hash}`}>[{new Date(block.header.timestamp).toLocaleString()}] {block.header.hash}</Link>
            <span> ({block.txs.length})</span>
        </div>
    )
}

export async function loader({params}) {
    const {blocksCount} = await Api.getStatus();

    const blocks = await Api.getBlocks(blocksCount - blocksPerPage, blocksCount);

    return {blocks, blocksCount};
}

function BlocksRoute() {
    const {blocks: defaultBlocks, blocksCount} = useLoaderData()
    const [blocks, setBlocks] = useState(defaultBlocks)

    const pageCount = Math.ceil(blocksCount / blocksPerPage)

    const handlePageClick = async ({selected}) => {
        const fromBlock = blocksCount - ((selected+1) * blocksPerPage)
        const toBlock = blocksCount - (((selected+1) - 1) * blocksPerPage)
        const updated = await Api.getBlocks(fromBlock, toBlock);

        setBlocks(updated)
    }

    return (
        <div className="container">
            <div className={"block_list"}>
                <Blocks blocks={blocks}/>
                <ReactPaginate
                    breakLabel="..."
                    nextLabel="next >"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    pageCount={pageCount}
                    previousLabel="< previous"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item page-item--previous"
                    previousLinkClassName="page-link"
                    nextClassName="page-item page-item--next"
                    nextLinkClassName="page-link"
                    breakClassName="page-item"
                    breakLinkClassName="page-link"
                    containerClassName="pagination"
                    activeClassName="active"
                    renderOnZeroPageCount={true}
                />
            </div>
        </div>
    );
}

export default BlocksRoute;
