import { InfoIcon, CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Container } from '@chakra-ui/react'
import { Tooltip } from '@chakra-ui/react'
import Link from 'next/link'
import './NetworkStatus.scss'

const getMinFromMs = (ms) => Math.floor((ms/1000)/60)
const getSecFromMs = (ms) => Math.floor((ms/1000))

function NetworkStatus ({status}) {
    const msFromLastBlock = new Date() - new Date(status.latestBlock.header.timestamp)
    const networkStatus = getMinFromMs(msFromLastBlock) < 15
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
                    <span>#{status.epoch.index}</span>
                    
                    <Tooltip 
                        label={`Next Epoch will started at ${new Date(status.epoch.endTime).toLocaleDateString()}`}
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
                    <span>{status.network}</span>
                    
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
                    <Link href={`/block/${status.latestBlock.header.hash}`}>
                        #{status.latestBlock.header.height}, 
                        
                        {getMinFromMs(msFromLastBlock) < 1 ? (
                            <> {getSecFromMs(msFromLastBlock)} sec. ago</>
                        ) : (
                            <> {getMinFromMs(msFromLastBlock)} min. ago</>
                        )}
                    </Link>
                </div>
            </div>
        </Container>
    )
}

export default NetworkStatus