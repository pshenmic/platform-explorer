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
                <span className={"block_list_item__txs"}>({block.txs.length})</span>
            </Link>
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
