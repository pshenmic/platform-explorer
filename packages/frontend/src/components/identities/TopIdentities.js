'use client'

import { SideBlock } from '../containers'
import { Flex, Box, Container } from '@chakra-ui/react'
import Link from 'next/link'
import { InfoCard } from '../cards'
import './TopIdentitieCard.scss'
import './TopIdentities.scss'

const identities = [
  {
    name: 'DQ-Broderick-29645-backup.dash',
    balance: 25001000000000,
    identifier: '7JXCp9e9whJ64ViKJi4ppE9BTZB77rsPDaTMLYe59D8M'
  },
  {
    name: 'DQ-Test-00000-backup.dash',
    balance: 24009000000000,
    identifier: '85T9pkLWY2WbHVE1k5PEvov8RJ1E9Y6QqfkCaSKfzioH'
  },
  {
    name: 'DQ-Test-00000-backup.dash',
    balance: 23001000000000,
    identifier: 'BhgerQ1vMMGr6QdxBQ863q7QGwQcsaRtxzZqVJvPJ66f'
  }
]

export default function TopIdentities () {
  return (
    <SideBlock>
        <Flex justifyContent={'space-between'} px={6} mb={4}>
            <div>Top Identities:</div>
            <Box color={'gray.500'}>Balance</Box>
        </Flex>

        {identities.map((identitie, i) => (
            <Container p={0} mx={0} my={3} maxW={'none'}>
                <Link href={`/identity/${identitie.identifier}`}>
                    <InfoCard className={'IdentitieCard'} clickable={true} key={i}>
                        <Flex alignItems={'center'} justifyContent={'space-between'}>
                            <Flex alignItems={'center'}>
                                <div className={'IdentitieCard__Img'}></div>
                                <div className={'IdentitieCard__Name'}>{identitie.name}</div>
                            </Flex>

                            <div className={'IdentitieCard__Balance'}>{identitie.balance}</div>
                        </Flex>
                    </InfoCard>
                </Link>
            </Container>
        ))}
    </SideBlock>
  )
}
