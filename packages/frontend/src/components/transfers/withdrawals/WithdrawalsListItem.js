import { Grid, GridItem } from '@chakra-ui/react'
import { ArrowCornerIcon } from '../../ui/icons'
import { Identifier, Credits } from '../../data'
import './WithdrawalsListItem.scss'

function WithdrawalsListItem ({ withdrawal }) {
  // temp
  if (!withdrawal?.recipient) withdrawal.recipient = '376neLp6VAHDRvEFUG5ZR1tuevHynCGB3Scjaa8BodG7'

  return (
    <div className={'WithdrawalsListItem'}>
      <Grid className={'WithdrawalsListItem__Content'}>
        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Timestamp'}>
          {new Date(withdrawal.timestamp).toLocaleString()}
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--TxHash'}>
          <Identifier styles={['highlight-both']}>{withdrawal.txHash}</Identifier>
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Address'}>
          {withdrawal?.recipient &&
            <a href={withdrawal.recipient}>
              <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'10px'}/>
              <Identifier styles={['highlight-both']}>{withdrawal.recipient}</Identifier>
            </a>
          }
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Document'}>
          -
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Amount'}>
          <Credits>{withdrawal.amount}</Credits>
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Status'}>

        </GridItem>
      </Grid>
    </div>
  )
}

export default WithdrawalsListItem
