import React, {useState} from 'react';
import { Link, useLoaderData } from "react-router-dom";
import * as Api from "../../util/Api";
import './blocks.css'
import ReactPaginate from "react-paginate";
const blocksPerPage = 30;

function Blocks({blocks}) {
    return blocks.map((block) =>
        <div key={block.block_id.hash} className={"block_list_item"}>
            <span>Block </span>
            <Link to={`/block/${block.block_id.hash}`}>{block.block_id.hash}</Link>
            <span> ({block.block.header.height})</span>
        </div>
    )
}

export async function loader({params}) {
    const {blocksCount} = await Api.getStatus();

    const blocks = await Api.getBlocks(1, blocksPerPage);

    return {blocks, blocksCount};
}

function BlocksRoute() {
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
