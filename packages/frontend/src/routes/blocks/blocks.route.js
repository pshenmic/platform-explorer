import React, {useState, useEffect} from 'react';
import {Link, useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './blocks.css'
import ReactPaginate from "react-paginate";
import GoToHeightForm from "./../../components/goToHeightForm/GoToHeightForm";
import ItemsOnPageSelector from "./../../components/itemsOnPageSelector/ItemsOnPageSelector";


const blocksPerPageConfig = {
    default: 25,
    values: [10, 25, 50, 75, 100]
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

export async function loader({params}) {
    const {blocksCount} = await Api.getStatus();

    const blocks = await Api.getBlocks(blocksCount - blocksPerPageConfig.default, blocksCount);

    return {blocks, blocksCount};
}

function BlocksRoute() {
    const {blocks: defaultBlocks, blocksCount} = useLoaderData()
    const [blocks, setBlocks] = useState(defaultBlocks)
    const [blocksPerPage, setBlocksPerPage] = useState(blocksPerPageConfig.default);
    const [paginateActivePage, setPaginateActivePage] = useState(0);
    const [searchedHeight, setSearchedHeight] = useState(0);
    const [searchedHeightCorrection, setSearchedHeightCorrection] = useState(true);

    const pageCount = Math.ceil(blocksCount / blocksPerPage)

    const handlePageClick = async ({selected}) => {
        const fromBlock = blocksCount - ((selected+1) * blocksPerPage)
        const toBlock = blocksCount - (((selected+1) - 1) * blocksPerPage)
        const updated = await Api.getBlocks(fromBlock, toBlock);

        setBlocks(updated)
    }

    const goToHeightInputChangeHandle = (e) => {
        const [lastBlock] = defaultBlocks;
        const lastBlockHeight = lastBlock.header.height;

        setSearchedHeight(Number(e.target.value));

        e.target.value.trim().length > 0 &&
        (Number(e.target.value) > lastBlockHeight || Number(e.target.value) < 1) ?
            setSearchedHeightCorrection(false): 
            setSearchedHeightCorrection(true);
    }

    const goToHeight = async (e) => {
        e.preventDefault();

        const [lastBlock] = defaultBlocks;
        const lastBlockHeight = lastBlock.header.height;

        if (searchedHeightCorrection && searchedHeight !== 0) {
            const page = Math.ceil((lastBlockHeight - searchedHeight) / blocksPerPage) - 1;
            setPaginateActivePage(page);
            handlePageClick({selected: page});
        } 
    }

    const itemsOnPageSelectHandler = async (e) => setBlocksPerPage(Number(e.target.value));


    useEffect(() => {
        const [lastBlock] = defaultBlocks;
        const lastBlockHeight = lastBlock.header.height;
        const [lastBlockOnPage] = blocks;
        const lastBlockOnPageHeight = lastBlockOnPage.header.height;
        const page = Math.ceil((lastBlockHeight + 1 - lastBlockOnPageHeight) / blocksPerPage) - 1;

        setPaginateActivePage(page);
        handlePageClick({selected: page});
    }, [blocksPerPage]);

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
                        forcePage={paginateActivePage} 
                    />
                
                    <ItemsOnPageSelector
                        itemsOnPageSelectHandler={itemsOnPageSelectHandler}
                        defaultValue={blocksPerPageConfig.default}
                        items={blocksPerPageConfig.values}
                    />
                </div>
            </div>
        </div>
    );
}

export default BlocksRoute;
