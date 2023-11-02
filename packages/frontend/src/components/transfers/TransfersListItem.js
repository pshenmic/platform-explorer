import {Link} from 'react-router-dom'
import { Box, Tag } from '@chakra-ui/react'
import { ArrowForwardIcon, ArrowBackIcon } from '@chakra-ui/icons'
import './TransfersListItem.scss'


function TransfersListItem({ transfer, identityId }) {
    const { amount, recipient, sender } = transfer

    const counterparty = recipient === identityId ? sender : recipient

    const direction = recipient === identityId ? 'from' : 'to'

    const typeIcon = direction === 'from' ? 
        <ArrowBackIcon boxSize={4} color="green.500" />:
        <ArrowForwardIcon boxSize={4} color="red.500" /> 
        
    let typeTitle = 'Transfer'

    if (counterparty === null) {
        typeTitle = direction === 'to' ? 'Withdraw' : 'TopUp'
    }
    
    return (

        <div className={'TransfersListItem'}>

            <span className={'TransfersListItem__Amount'}>
                { amount } Credits
            </span>
            
            <div className={'TransfersListItem__Timestamp'}>
                {new Date().toLocaleString()}
            </div>

            <div className={'TransfersListItem__InfoLine'}>

                <div className={'TransfersListItem__Type'}>

                    <Tag bg='whiteAlpha.200' mr={'2'}>
                        { typeIcon } <Box w={1}/> { typeTitle }
                    </Tag>

                </div>

                {(counterparty !== null &&
                    <span 
                        className={'TransfersListItem__Counterparty'}
                        title={direction}
                    >
                        { counterparty }
                        
                    </span>
                )}
                
            </div>
        </div>
        
    )
}

export default TransfersListItem