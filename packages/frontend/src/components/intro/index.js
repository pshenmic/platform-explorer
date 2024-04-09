import { 
    Box, 
    Text, 
    Heading
} from '@chakra-ui/react'

function Intro ({title, contentSource}) {
    return (
        <div>
            <Heading as={'h1'} size={'lg'} m={0}>{title}</Heading>

            <Box my={6} w={16} h={'px'} background={'gray.700'} />

            <Text>
                {contentSource}
            </Text>
        </div>
    )
}

export default Intro