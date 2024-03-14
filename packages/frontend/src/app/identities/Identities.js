'use client'

import {useEffect, useState} from 'react'
import * as Api from '../../util/Api'
import IdentitiesList from '../../components/identities/IdentitiesList'
import ReactPaginate from 'react-paginate'

import { 
    Container,
    Heading, 
} from '@chakra-ui/react'


function Identities() {
    const [loading, setLoading] = useState(true)
    const [identities, setIdentities] = useState([])
    const [total, setTotal] = useState(1)
    const pageSize = 25
    const [currentPage, setCurrentPage] = useState(0)
    const pageCount = Math.ceil(total / pageSize)


    const fetchData = () => {
        setLoading(true)

        Api.getIdentities(1, pageSize).then((identities) => {

            setIdentities(identities.resultSet)
            setTotal(identities.pagination.total)

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

    return (
        <Container 
            maxW='container.md' 
            mt={8}
            className={'IdentitiesPage'}
        >
            <Container 
                maxW='container.md' 
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm' >Identities</Heading>

                {!loading && <>
                    <IdentitiesList identities={identities}/>

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
                </>}

            </Container>
        </Container>
    )
}

export default Identities
