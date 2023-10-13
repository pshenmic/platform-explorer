import React, {useState, useEffect} from 'react';
import {Link, useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './blocks.css'
import ReactPaginate from "react-paginate";
import GoToHeightForm from "./../../components/goToHeightForm/GoToHeightForm";
import ItemsOnPageSelector from "./../../components/itemsOnPageSelector/ItemsOnPageSelector";


const paginateConfig = { 
    pageSize: {
        default: 25,
        values: [10, 25, 50, 75, 100],
    },
    defaultPage: 1
}

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
    const [status, paginatedBlocks] = await Promise.all([Api.getStatus(), Api.getBlocks(1, paginateConfig.pageSize.default, 'desc')])

    const {blocksCount} = status
    const {resultSet} = paginatedBlocks

    console.log('loader', {blocks: resultSet, blocksCount})

    return {blocks: resultSet, blocksCount};
}

function BlocksRoute() {
    const {blocks: defaultBlocks, blocksCount} = useLoaderData()
    const [blocks, setBlocks] = useState(defaultBlocks)
    const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchedHeight, setSearchedHeight] = useState(0);
    const [searchedHeightCorrection, setSearchedHeightCorrection] = useState(true);

    const pageCount = Math.ceil(blocksCount / pageSize)

    const handlePageClick = async ({selected}) => {
        const {resultSet} = await Api.getBlocks(selected+1, pageSize, 'desc')

        setBlocks(resultSet)
    }

    const goToHeightInputChangeHandle = (e) => {
        setSearchedHeight(Number(e.target.value));

        if (e.target.value.trim().length > 0 &&
            (Number(e.target.value) > blocksCount || Number(e.target.value) < 1)) {
            setSearchedHeightCorrection(false);
        } else {
            setSearchedHeightCorrection(true);
        }
    }

    const goToHeight = async (e) => {
        e.preventDefault();

        const [lastBlock] = defaultBlocks;
        const lastBlockHeight = lastBlock.header.height;

        if (searchedHeightCorrection && searchedHeight !== 0) {
            const page = Math.ceil((lastBlockHeight - searchedHeight + 2) / pageSize) - 1;

            setCurrentPage(page);
            handlePageClick({selected: page});
        } 
    }

    useEffect(() => {
        const [lastBlock] = defaultBlocks;
        const lastBlockHeight = lastBlock.header.height;
        const [lastBlockOnPage] = blocks;
        const lastBlockOnPageHeight = lastBlockOnPage.header.height;
        const page = Math.ceil((lastBlockHeight + 1 - lastBlockOnPageHeight) / pageSize) - 1;

        setCurrentPage(page);
        handlePageClick({selected: page});
    }, [pageSize]);

    return (
        <div className="container">
            <div className={"block_list"}>
                <span className="block_list__title">Last blocks</span>

                <Blocks blocks={blocks}/>

                <div className='list-navigation'>
                    <GoToHeightForm
                        goToHeightHandler={goToHeight}
                        goToHeightInputChangeHandle={goToHeightInputChangeHandle}
                        searchedHeightCorrection={searchedHeightCorrection}
                    />

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
                        forcePage={currentPage} 
                    />
                
                    <ItemsOnPageSelector
                        itemsOnPageSelectHandler={(e) => setPageSize(Number(e.target.value))}
                        defaultValue={paginateConfig.pageSize.default}
                        items={paginateConfig.pageSize.values}
                    />
                </div>
            </div>
        </div>
    );
}

export default BlocksRoute;
