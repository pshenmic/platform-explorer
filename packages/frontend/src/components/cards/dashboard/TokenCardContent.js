import { Badge, Flex } from '@chakra-ui/react'
import Link from 'next/link'
import { Identifier, NotActive } from '../../data'
import { currencyRound, getTokenName } from '../../../util'
import ImageGenerator from '../../imageGenerator'
import './TokenCardContent.scss'

export function TokenCardContent ({ token = {}, nullMessage = 'No data' }) {
  const {
    identifier,
    tokenIdentifier,
    localizations,
    transitionCount
  } = token || {}

  if (!token || !tokenIdentifier) {
    return <NotActive>{nullMessage}</NotActive>
  }

  const txsCount = currencyRound(transitionCount)

  return (
    <Link className={'TokenCardContent'} href={`/token/${identifier}`}>
      <Flex gap={'0.75rem'} alignItems={'center'} justifyContent={'space-between'}>
        <div className={'TokenCardContent__NameContainer'}>
          <ImageGenerator
            className={'TokenCardContent__Avatar'}
            username={tokenIdentifier}
            lightness={50}
            saturation={50}
            width={24}
            height={24}
          />
          <span className={'TokenCardContent__Name'}>{getTokenName(localizations)}</span>
        </div>
        <Badge className={'TokenCardContent__Count'}>
          <span className={'TokenCardContent__CountValue'}>{txsCount}</span>
          <span>txs</span>
        </Badge>
      </Flex>

      <Identifier
        ellipsis={true}
        styles={['highlight-both']}
      >
        {tokenIdentifier}
      </Identifier>
    </Link>
  )
}
