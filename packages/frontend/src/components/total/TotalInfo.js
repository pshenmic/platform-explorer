import './TotalInfo.scss'
import './TotalInfoItem.scss'
import { Container, Flex } from '@chakra-ui/react'
import Link from 'next/link'

export default function TotalInfo ({
  blocks,
  transactions,
  dataContracts,
  documents,
  identities,
  loading,
  event = null
}) {
  const eventClasses = {
    christmas: 'TotalInfo--Christmas'
  }

  return (
    <Container
      className={`TotalInfo ${event ? eventClasses?.[event] : ''}`}
      maxW={'none'}
      borderColor={'gray.800'}
      p={0}
      m={0}
    >
      <Flex
        className={'TotalInfo__ContentContainer'}
        justify={'space-between'}
        wrap={'wrap'}
      >
        <Link href={'/blocks/'} className={'InfoBlock InfoBlock--NoBorder TotalInfo__Item TotalInfoItem TotalInfoItem--Blocks TotalInfoItem--Clikable'}>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>
            {`${blocks || '-'}`}
          </div>
          <div className={'TotalInfoItem__Title'}>Blocks</div>
        </Link>

        <Link href={'/transactions/'} className={'InfoBlock InfoBlock--NoBorder TotalInfo__Item TotalInfoItem TotalInfoItem--Transactions TotalInfoItem--Clikable'}>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>
            {`${transactions || '-'}`}
          </div>
          <div className={'TotalInfoItem__Title'}>Transactions</div>
        </Link>

        <Link href={'/dataContracts/'} className={'InfoBlock InfoBlock--NoBorder TotalInfo__Item TotalInfoItem TotalInfoItem--DataContracts TotalInfoItem--Clikable'}>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>
            {`${dataContracts || '-'}`}
          </div>
          <div className={'TotalInfoItem__Title'}>Data Contracts</div>
        </Link>

        <div className={'InfoBlock InfoBlock--NoBorder TotalInfo__Item TotalInfoItem TotalInfoItem--Documents'}>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>
            {`${documents || '-'}`}
          </div>
          <div className={'TotalInfoItem__Title'}>Documents</div>
        </div>

        <Link href={'/identities/'} className={'InfoBlock InfoBlock--NoBorder TotalInfo__Item TotalInfoItem TotalInfoItem--Identities TotalInfoItem--Clikable'}>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>
            {`${identities || '-'}`}
          </div>
          <div className={'TotalInfoItem__Title'}>Identities</div>
        </Link>
      </Flex>
    </Container>
  )
}
