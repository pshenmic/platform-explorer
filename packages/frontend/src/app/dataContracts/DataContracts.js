'use client'

import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'
import ReactPaginate from 'react-paginate'

import { 
    Container,
    Heading, 
} from '@chakra-ui/react'


function DataContractsLayout() {
    const [loading, setLoading] = useState(true)
    const [dataContracts, setDataContracts] = useState(null)
    const [total, setTotal] = useState(1)
    const pageSize = 25
    const [currentPage, setCurrentPage] = useState(0)
    const pageCount = Math.ceil(total / pageSize)
    

    const fetchData = () => {
        setLoading(true)

        Api.getDataContracts(1, pageSize).then((res) => {

            setDataContracts(res.resultSet)
            setTotal(res.pagination.total)

        }).catch((error) => {

            console.log(error)

        }).finally(() => {

            setLoading(false)
            
        })
    }

    useEffect(fetchData, [])

    
    const handlePageClick = async ({selected}) => {

        const {resultSet} = await Api.getDataContracts(selected+1, pageSize, 'desc')
        setCurrentPage(selected)
        setDataContracts(resultSet)

    }


    if (!loading) return (
        <div className={'container'}>
            {dataContracts && 
                <Container 
                    maxW='container.md' 
                    padding={3}
                    mt={8}
                    mb={4}
                    borderWidth='1px' borderRadius='lg'
                    className={'InfoBlock'}
                > 

                    <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Data contracts</Heading>

                    <DataContractsList dataContracts={dataContracts} size='l'/>

                    {pageCount > 1 && 
                        <div className={'ListNavigation'}>
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
                        </div>
                    }


                </Container>
            }

        </div>
    )
}

export default DataContractsLayout