'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { SideBlock } from '../containers'
import { Flex, Box, Container } from '@chakra-ui/react'
import Link from 'next/link'
import { InfoCard } from '../cards'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import { ErrorMessageBlock } from '../Errors'
import ImageGenerator from '../imageGenerator'
import './TopIdentitieCard.scss'
import './TopIdentities.scss'

function Item ({ identitie, loading = false }) {
  return (
    <Container p={0} mx={0} my={3} maxW={'none'}>
      {!loading
        ? <Link href={`/identity/${identitie.identifier}`}>
            <InfoCard className={'IdentitieCard'} clickable={true}>
              <Flex alignItems={'center'} justifyContent={'space-between'}>
                  <Flex alignItems={'center'}>
                      <div className={'IdentitieCard__Img'}>
                        <ImageGenerator username={identitie.identifier} lightness={50} saturation={50} width={42} height={42} />
                      </div>
                      <div className={'IdentitieCard__Name'}>DQ-Broderick-29645-backup.dash</div>
                  </Flex>

                  <div className={'IdentitieCard__Balance'}>{currencyRound(identitie.balance)}</div>
              </Flex>
            </InfoCard>
        </Link>
        : <InfoCard className={'IdentitieCard'} loading={true}/>
      }
    </Container>
  )
}

export default function TopIdentities () {
  const [identities, setIdentities] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getIdentities(1, 3, 'desc', 'balance')
      .then(res => fetchHandlerSuccess(setIdentities, res))
      .catch(err => fetchHandlerError(setIdentities, err))
  }

  useEffect(fetchData, [])

  return (
    <SideBlock>
        {!identities.error
          ? <>
              <Flex justifyContent={'space-between'} px={6} mb={4}>
                  <div>Top Identities:</div>
                  <Box color={'gray.500'}>Balance</Box>
              </Flex>

              {!identities.loading
                ? identities?.data?.resultSet?.length
                  ? identities.data.resultSet.map((identitie, i) => <Item identitie={identitie} key={i}/>)
                  : <ErrorMessageBlock h={250} text={'Identities not found'}/>
                : Array.from({ length: 3 }, (x, i) => <Item loading={true} key={i}/>)
              }
            </>
          : <ErrorMessageBlock h={250}/>
        }
    </SideBlock>
  )
}
