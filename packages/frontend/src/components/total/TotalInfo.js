import './TotalInfo.scss'
import './TotalInfoItem.scss'
import { Container, Flex } from '@chakra-ui/react'
import Link from 'next/link'

export default function TotalInfo ({ blocks, transactions, dataContracts, documents, identities, loading }) {
  return (
    <Container
      className={'TotalInfo'}
      maxW={'none'}
      borderColor={'gray.800'}
      p={0}
      m={0}
    >
      <Flex
        className={'TotalInfo__ContentContainer'}
        justify={'space-between'}
        maxW={'container.xl'}
        wrap={'wrap'}
      >
        <Link href={'/blocks/'} className={'InfoBlock TotalInfo__Item TotalInfoItem TotalInfoItem--Blocks'}>
          <div className={'TotalInfoItem__Title'}>Blocks</div>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>{`${blocks || '-'}`}</div>
        </Link>

        <Link href={'/transactions/'} className={'InfoBlock TotalInfo__Item TotalInfoItem TotalInfoItem--Transactions'}>
          <div className={'TotalInfoItem__Title'}>Transactions</div>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>{`${transactions || '-'}`}</div>
        </Link>

        <Link href={'/dataContracts/'} className={'InfoBlock TotalInfo__Item TotalInfoItem TotalInfoItem--DataContracts'}>
          <div className={'TotalInfoItem__Title'}>Data Contracts</div>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>{`${dataContracts || '-'}`}</div>
        </Link>

        <div className={'InfoBlock TotalInfo__Item TotalInfoItem TotalInfoItem--Documents'}>
          <div className={'TotalInfoItem__Title'}>Documents</div>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>{`${documents || '-'}`}</div>
        </div>

        <Link href={'/identities/'} className={'InfoBlock TotalInfo__Item TotalInfoItem TotalInfoItem--Identities'}>
          <div className={'TotalInfoItem__Title'}>Identities</div>
          <div className={`TotalInfoItem__Value ${loading ? 'TotalInfoItem__Value--Loading' : ''}`}>{`${identities || '-'}`}</div>
        </Link>
      </Flex>
    </Container>
  )
}
