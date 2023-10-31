import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './identities.scss'
import {Link} from "react-router-dom";
import IdentitiesList from "../../components/identities/IdentitiesList";

import { 
    Container,
    Heading, 
} from "@chakra-ui/react"


export async function loader({params}) {
    const {identifier} = params

    return await Api.getIdentities(identifier);
}

function IdentitiesRoute() {
    const identities = useLoaderData().resultSet;

    return (
        <Container 
            maxW='container.md' 
            mt={8}
            className='IdentitiesPage'
        >
            <Container 
                maxW='container.md' 
                borderWidth='1px' borderRadius='lg'
                className='InfoBlock'
            >
                <Heading className='InfoBlock__Title' as='h1' size='sm' >Identities</Heading>

                <IdentitiesList identities={identities}/>

            </Container>
        </Container>
    );
}

export default IdentitiesRoute;
