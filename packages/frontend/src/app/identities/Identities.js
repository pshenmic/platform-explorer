'use client'

import {useEffect, useState} from 'react'
import * as Api from '../../util/Api'
import IdentitiesList from '../../components/identities/IdentitiesList'
import Pagination from '../../components/pagination'

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

        Api.getIdentities(1, pageSize, 'desc')
            .then((identities) => {
                setIdentities(identities.resultSet)
                setTotal(identities.pagination.total)
            })
            .catch(console.log)
            .finally(() => setLoading(false))
    }

    useEffect(fetchData, [])

    const handlePageClick = ({selected}) => {
        Api.getDataContracts(selected+1, pageSize, 'desc')
            .then((res) => {
                setCurrentPage(selected)
                setIdentities(res.resultSet)
            })
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
                            <Pagination 
                                onPageChange={handlePageClick}
                                pageCount={pageCount}
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
