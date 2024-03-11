'use client'

import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'

import { 
    Container,
    Heading, 
} from '@chakra-ui/react'


function DataContractsLayout() {
    const [dataContracts, setDataContracts] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = () => {
        setLoading(true)

        try {
            Api.getDataContracts(1, 30).then((res) => {

                setDataContracts(res.resultSet)
                setLoading(false)

            })
        } catch(error) {
            console.log(error)
        }
    }

    useEffect(fetchData, [])

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

                </Container>
            }

        </div>
    )
}

export default DataContractsLayout