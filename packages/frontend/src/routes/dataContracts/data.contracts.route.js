import React, {useEffect, useState} from 'react'
import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'

import { 
    Container,
    Heading, 
} from '@chakra-ui/react'

function DataContractsRoute() {
    const [dataContracts, setDataContracts] = useState(null)
    const [loading, setLoading] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        Api.getDataContracts(1, 30)
            .then((dataContracts) => setDataContracts(dataContracts.resultSet))
            .catch((err) => {
                setError(err)
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className={'container'}>
            {error && <div>Error {error}</div>}
            {loading && <div>Loading data contracts from API</div>}

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
    );
}

export default DataContractsRoute;
