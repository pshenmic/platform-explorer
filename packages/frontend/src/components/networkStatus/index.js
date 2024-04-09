import { InfoIcon, CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Container } from '@chakra-ui/react'
import { Tooltip } from '@chakra-ui/react'
import Link from 'next/link'
import './NetworkStatus.scss'

const networkStatus = true;

function NetworkStatus ({}) {
    const NetworkStatusIcon = networkStatus ? 
        <CheckCircleIcon color={'green.500'} ml={2}/>: 
        <WarningTwoIcon color={'yellow.400'} ml={2}/>

    return (
        <Container 
            className={'NetworkStatus'}
            maxW={'100%'}
            m={0}
            p={6}
            pl={6}
            h={'100%'}
            borderWidth={'1px'} borderRadius={'lg'}
        >
            <div className={'NetworkStatus__InfoItem'}>
                <div className={'NetworkStatus__Title'}>Epoch:</div>
                <div className={'NetworkStatus__Value'}>
                    <span>#7</span>
                    
                    <Tooltip 
                        label={'Next Epoch will started at 11/04/2024'}
                        aria-label={'A tooltip'} 
                        placement={'top'}
                        hasArrow 
                        bg={'gray.700'} 
                        color={'white'}
                    >
                        <InfoIcon boxSize={4} color={'gray.600'} ml={2}/>
                    </Tooltip>
                </div>
            </div>

            <div className={'NetworkStatus__InfoItem'}>
                <div className={'NetworkStatus__Title'}>Network:</div>
                <div className={'NetworkStatus__Value'}>
                    <span>dash-testnet-42</span>
                    
                    <Tooltip 
                        label={`${networkStatus ? 
                            'The network works well' : 
                            'Interruptions are observed, it will pass soon...'
                        }`} 
                        aria-label={'Network status'}
                        placement={'top'}
                        hasArrow 
                        bg={'gray.700'} 
                        color={'white'}
                    >
                        {NetworkStatusIcon}
                    </Tooltip>
                </div>
            </div>

            <div className={'NetworkStatus__InfoItem'}>
                <div className={'NetworkStatus__Title'}>Latest block:</div>
                <div className={'NetworkStatus__Value'}>
                    <Link href={'/block/16EF8CB61B23944C6BFCA637FF80B5A88A3FE22BC44C92615E23F9B711C83FF1'}>#445522, 5 Min. ago</Link>
                </div>
            </div>
        </Container>
    )
}

export default NetworkStatus