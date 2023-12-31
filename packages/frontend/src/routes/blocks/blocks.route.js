import React, {useState, useEffect} from 'react'
import {Link, useLoaderData} from 'react-router-dom'
import * as Api from '../../util/Api'
import ReactPaginate from 'react-paginate'
import GoToHeightForm from './../../components/goToHeightForm/GoToHeightForm'
import PageSizeSelector from './../../components/pageSizeSelector/PageSizeSelector'
import BlocksList from '../../components/blocks/BlocksList'
import './Blocks.scss'

import { 
    Container,
    Heading, 
} from '@chakra-ui/react'


const paginateConfig = { 
    pageSize: {
        default: 25,
        values: [10, 25, 50, 75, 100],
    },
    defaultPage: 1
}


export async function loader() {
    const paginatedBlocks = await Api.getBlocks(paginateConfig.defaultPage, paginateConfig.pageSize.default, 'desc')
    const {resultSet, pagination} = paginatedBlocks

    return {blocks: resultSet, total: pagination.total};
}

function BlocksRoute() {
    const {blocks: defaultBlocks, total} = useLoaderData()
    const [blocks, setBlocks] = useState(defaultBlocks)
    const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
    const [currentPage, setCurrentPage] = useState(0)
    const [blockHeightToSearch, setBlockHeightToSearch] = useState(0)
    const pageCount = Math.ceil(total / pageSize)

    const handlePageClick = async ({selected}) => {
        const {resultSet} = await Api.getBlocks(selected+1, pageSize, 'desc')
        
        setCurrentPage(selected)

        setBlocks(resultSet)
    }

    const goToHeight = async (e) => {
        e.preventDefault();

        const page = Math.ceil((total - blockHeightToSearch + 2) / pageSize) - 1;

        setCurrentPage(page);

        handlePageClick({selected: page});
    }

    useEffect(() => {
        setCurrentPage(0);

        handlePageClick({selected: 0});
    }, [pageSize]);

    return (
        <Container 
            maxW='container.lg' 
            color='white'
            mt={8}
            mb={8}
            className={'Blocks'}
        >
            <Container 
                maxW='container.lg' 
                _dark={{ color: "white" }}
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Blocks</Heading>
                <BlocksList blocks={blocks}/>


                <div className={'ListNavigation'}>
                    <GoToHeightForm
                        goToHeightHandler={goToHeight}
                        goToHeightChangeHandle={(e) => setBlockHeightToSearch(e.target.value)}
                        isValid = {()=> {
                            return (
                                blockHeightToSearch.length > 0 &&
                                Number(blockHeightToSearch) <= total && 
                                Number(blockHeightToSearch) > 0
                            )}
                        }
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
                
                    <PageSizeSelector
                        PageSizeSelectHandler={(e) => setPageSize(Number(e.target.value))}
                        defaultValue={paginateConfig.pageSize.default}
                        items={paginateConfig.pageSize.values}
                    />
                </div>

            </Container>
        </Container>
    );
}

export default BlocksRoute;
