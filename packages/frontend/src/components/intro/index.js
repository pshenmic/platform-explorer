import { 
    Box, 
    Text, 
    Heading
} from '@chakra-ui/react'

function Intro ({title, contentSource}) {
    return (
        <div>
            <Heading as={'h1'} size={'lg'} m={0}>{title}</Heading>

            <Box my={4} w={16} h={'px'} background={'gray.700'} />

            <div>{contentSource}</div>
        </div>
    )
}

export default Intro