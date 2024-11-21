import { Grid, GridItem } from '@chakra-ui/react'
import { ArrowCornerIcon } from '../../ui/icons'
import { Identifier, Credits } from '../../data'
import { ValueContainer } from '../../ui/containers'
import { RateTooltip } from '../../ui/Tooltips'
import StatusIcon from './StatusIcon'
import Link from 'next/link'
import './WithdrawalsListItem.scss'

function WithdrawalsListItem ({ withdrawal, rate, l1explorerBaseUrl }) {
  console.log(withdrawal)

  // temp
  // if (!withdrawal?.recipient) withdrawal.recipient = '376neLp6VAHDRvEFUG5ZR1tuevHynCGB3Scjaa8BodG7'
  // if (!withdrawal?.document) withdrawal.document = '9ek4kMqGBHZtoBq3QatveYmDXHLjigeq4JsNZ77Qvsgi'
  // if (!withdrawal?.status) withdrawal.status = 'OK'

  return (
    <div className={'WithdrawalsListItem'}>
      <Grid className={'WithdrawalsListItem__Content'}>
        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Timestamp'}>
          {new Date(withdrawal.timestamp).toLocaleString()}
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--TxHash'}>
          {withdrawal?.hash
            ? <Link href={'/transaction/' + withdrawal.hash}>
                <ValueContainer className={''} light={true} clickable={true}>
                  <Identifier styles={['highlight-both']}>{withdrawal.hash}</Identifier>
                </ValueContainer>
              </Link>
            : '-'
          }
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Address'}>
          {withdrawal?.recipient
            ? <a
                {...(l1explorerBaseUrl ? { href: `${l1explorerBaseUrl}/address/${withdrawal?.recipient}` } : {})}
                target={l1explorerBaseUrl ? '_blank' : '_self'}
                rel={'noopener noreferrer'}
              >
                <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'10px'}/>
                <Identifier styles={['highlight-both']}>{withdrawal.recipient}</Identifier>
              </a>
            : '-'
          }
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Document'}>
          {withdrawal?.document
            ? <a href={'/document/' + withdrawal.recipient}>
                <ValueContainer className={''} light={true} clickable={true}>
                  <Identifier styles={['highlight-both']}>{withdrawal.recipient}</Identifier>
                </ValueContainer>
              </a>
            : '-'
          }
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Amount'}>
          <RateTooltip credits={withdrawal.amount} rate={rate}>
            <span><Credits>{withdrawal.amount}</Credits></span>
          </RateTooltip>
        </GridItem>

        <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Status'}>
          {/*{withdrawal.status}*/}
          <StatusIcon status={withdrawal.status} w={'18px'} h={'18px'}/>
        </GridItem>
      </Grid>
    </div>
  )
}

export default WithdrawalsListItem
