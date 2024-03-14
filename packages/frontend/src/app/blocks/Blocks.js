'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import ReactPaginate from 'react-paginate'
import GoToHeightForm from '../../components/goToHeightForm/GoToHeightForm'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
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


function Blocks() {
    const [loading, setLoading] = useState(true)
    const [blocks, setBlocks] = useState([])
    const [total, setTotal] = useState(1)
    const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
    const [currentPage, setCurrentPage] = useState(0)
    const [blockHeightToSearch, setBlockHeightToSearch] = useState(0)
    const pageCount = Math.ceil(total / pageSize)

    
    const fetchData = () => {
        setLoading(true)

        Api.getBlocks(
            paginateConfig.defaultPage, 
            paginateConfig.pageSize.default, 
            'desc'
        ).then((res) => {

            setBlocks(res.resultSet)
            setTotal(res.pagination.total)

        }).catch((error)=>{

            console.log(error)

        }).finally(() => {

            setLoading(false)
            
        }) 
    }

    useEffect(fetchData, [])


    const handlePageClick = ({selected}) => {

        Api.getBlocks(selected+1, pageSize, 'desc').then((res) => {

            setCurrentPage(selected)
            setBlocks(res.resultSet)

        })
    }


    const goToHeight = (e) => {

        e.preventDefault()

        const page = Math.ceil((total - blockHeightToSearch + 2) / pageSize) - 1
        setCurrentPage(page)
        handlePageClick({selected: page})
        
    }


    useEffect(() => {

        setCurrentPage(0)
        handlePageClick({selected: 0})

    }, [pageSize])


    if (!loading) return (
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
    )
}

export default Blocks
