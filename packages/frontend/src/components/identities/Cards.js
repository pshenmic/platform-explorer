'use client'

import { Flex, Container } from '@chakra-ui/react'
import Link from 'next/link'
import { InfoCard } from '../cards'
import { currencyRound } from '../../util'
import { ErrorMessageBlock } from '../Errors'
import ImageGenerator from '../imageGenerator'
import { RateTooltip } from '../ui/Tooltips'
import './IdentityCard.scss'
import { Identifier, Alias } from '../data'

function IdentityCard ({ identity, rate, loading = false }) {
  return (
    <Container p={0} mx={0} maxW={'none'}>
      {!loading
        ? <Link href={`/identity/${identity.identifier}`}>
            <InfoCard className={'IdentityCard'} clickable={true}>
              <Flex alignItems={'center'} justifyContent={'space-between'}>
                  <div className={'IdentityCard__AliasContainer'}>
                      <div className={'IdentityCard__Img'}>
                        <ImageGenerator username={identity.identifier} lightness={50} saturation={50} width={42} height={42} />
                      </div>

                      {(() => {
                        const activeAlias = identity?.aliases?.find(alias => alias.status === 'ok')
                        return activeAlias
                          ? <Alias alias={activeAlias.alias}/>
                          : <Identifier styles={['highlight-both']}>
                              {identity.identifier}
                            </Identifier>
                      })()}
                  </div>

                  <div className={'IdentityCard__Balance'}>
                    <RateTooltip credits={identity?.balance} rate={rate}>
                      <span>{currencyRound(identity?.balance)}</span>
                    </RateTooltip>
                  </div>
              </Flex>
            </InfoCard>
        </Link>
        : <InfoCard className={'IdentityCard IdentityCard--Loading'} loading={true}/>
      }
    </Container>
  )
}

function IdentitiesCards ({ items, rate }) {
  return (
    <Flex flexDirection={'column'} gap={'0.5rem'}>
      {!items.error
        ? !items.loading
            ? items?.data?.resultSet?.length
              ? items.data.resultSet.map((identity, i) => <IdentityCard identity={identity} rate={rate} key={i}/>)
              : <ErrorMessageBlock h={250} text={'Identities not found'}/>
            : Array.from({ length: 3 }, (x, i) => <IdentityCard loading={true} key={i}/>)
        : <ErrorMessageBlock h={250}/>
      }
    </Flex>
  )
}

export {
  IdentitiesCards,
  IdentityCard
}
