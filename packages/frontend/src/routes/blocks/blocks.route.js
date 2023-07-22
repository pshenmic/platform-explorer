import React, {useState, useEffect} from 'react';
import {Form, Link, useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './blocks.css'
import ReactPaginate from "react-paginate";

function Blocks({blocks}) {
    return blocks.map((block) =>
        <div key={block.block_id.hash} className={"block_list_item"}>
            <Link to={`/block/${block.block_id.hash}`}>Block #{block.block_id.hash} ({block.block.header.height})</Link>
        </div>
    )
}

export async function loader({params}) {
    const {blocksCount} = await Api.getStatus();
    const blocks = await Api.getBlocks();
    return {blocks, blocksCount};
}

function BlocksRoute() {
    const blocksPerPage = 30;

    const {blocks: defaultBlocks, blocksCount} = useLoaderData()
    const [blocks, setBlocks] = useState(defaultBlocks.blocks)

    const pageCount = Math.ceil(blocksCount / 30)

    const handlePageClick = async ({selected}) => {
        const updated = await Api.getBlocks(selected + 1, blocksPerPage);
        setBlocks(updated.blocks)

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
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
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
