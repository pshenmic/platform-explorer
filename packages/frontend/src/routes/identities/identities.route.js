import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './identities.scss'
import {Link} from "react-router-dom";
import IdentitiesList from "../../components/identities/IdentitiesList";

import { 
    Container,
    Heading, 
} from "@chakra-ui/react"


const identities = [
    {
        identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR',
        balance: 5582
    },
    {
        identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR',
        balance: 5582
    },
    {
        identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR',
        balance: 5582
    },
    {
        identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR',
        balance: 5582
    },
    {
        identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR',
        balance: 5582
    },
    {
        identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR',
        balance: 5582
    },
]

export async function loader({params}) {
    const {identifier} = params

    // const identity = await Api.getDocumentsByDataContract('BJ3WqMH4HyvZZAPW8srpq41ne6qhR1e4VMaU6HbSW7Dg');

    return await Api.getIdentity('BJ3WqMH4HyvZZAPW8srpq41ne6qhR1e4VMaU6HbSW7Dg');
}

function IdentitiesRoute({ cookies, children }) {
    // const identities = useLoaderData();

    return (
        <Container 
            maxW='container.xl' 
            mt={8}
            className='IdentitiesPage'
        >
            <Container 
                maxW='container.xl' 
                borderWidth='1px' borderRadius='lg'
                className='InfoBlock'
            >
                <Heading className='InfoBlock__Title' as='h1' size='sm' >Identitys list</Heading>

                <IdentitiesList items={identities}/>

            </Container>
        </Container>
    );
}

export default IdentitiesRoute;
