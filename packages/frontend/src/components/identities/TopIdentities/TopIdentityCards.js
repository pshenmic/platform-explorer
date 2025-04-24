'use client'

import { Flex, Container } from '@chakra-ui/react'
import Link from 'next/link'
import { InfoCard } from '../../cards'
import { currencyRound } from '../../../util'
import { ErrorMessageBlock } from '../../Errors'
import { RateTooltip } from '../../ui/Tooltips'
import { Identifier, Alias } from '../../data'
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from '../../ui/icons'
import './TopIdentityCard.scss'

function TopIdentityCard ({ identity, rate, place, loading = false }) {
  const activeAlias = identity?.aliases?.find(alias => alias.status === 'ok')

  return (
    <Container p={0} mx={0} maxW={'none'}>
      {!loading
        ? <Link href={`/identity/${identity.identifier}`}>
            <InfoCard className={'TopIdentityCard'} clickable={true}>
              <Flex alignItems={'center'} gap={'1rem'} justifyContent={'space-between'}>
                <div className={'TopIdentityCard__AliasContainer'}>
                  {activeAlias
                    ? <Alias avatarSource={identity.identifier} alias={activeAlias.alias}/>
                    : <Identifier avatar={true} styles={['highlight-both']}>
                        {identity.identifier}
                      </Identifier>
                  }
                </div>

                <div className={'TopIdentityCard__Balance'}>
                  <RateTooltip credits={identity?.balance} rate={rate}>
                    <span>{currencyRound(identity?.balance)}</span>
                  </RateTooltip>

                  {place === 1 && <FirstPlaceIcon/>}
                  {place === 2 && <SecondPlaceIcon/>}
                  {place === 3 && <ThirdPlaceIcon/>}
                </div>
              </Flex>
            </InfoCard>
          </Link>
        : <InfoCard className={'TopIdentityCard TopIdentityCard--Loading'} loading={true}/>
      }
    </Container>
  )
}

function TopIdentitiesCards ({ items, rate }) {
  return (
    <Flex flexDirection={'column'} gap={'0.5rem'}>
      {!items.error
        ? !items.loading
            ? items?.data?.resultSet?.length
              ? items.data.resultSet.map((identity, i) =>
                  <TopIdentityCard
                    identity={identity}
                    place={i + 1}
                    rate={rate}
                    key={i}
                  />
              )
              : <ErrorMessageBlock h={250} text={'Identities not found'}/>
            : Array.from({ length: 3 }, (_, i) =>
              <TopIdentityCard
                loading={true}
                place={i + 1}
                key={i}/>
            )
        : <ErrorMessageBlock h={250}/>
      }
    </Flex>
  )
}

export {
  TopIdentitiesCards,
  TopIdentityCard
}
