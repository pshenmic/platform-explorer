'use client'

import {useEffect, useState} from 'react'
import * as Api from '../../util/Api'
import IdentitiesList from '../../components/identities/IdentitiesList'

import { 
    Container,
    Heading, 
} from '@chakra-ui/react'


function Identities() {
    const [identities, setIdentities] = useState([])
    const [loading, setLoading] = useState(true)


    const fetchData = () => {
        setLoading(true)

        Api.getIdentities().then((identities) => {

            setIdentities(identities.resultSet)

        }).catch((error) => {

            console.log(error)

        }).finally(() => {

            setLoading(false)
            
        })
    }

    useEffect(fetchData, [])

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

                {!loading && 
                    <IdentitiesList identities={identities}/>
                }

            </Container>
        </Container>
    )
}

export default Identities
