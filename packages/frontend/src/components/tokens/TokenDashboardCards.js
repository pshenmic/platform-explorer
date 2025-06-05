'use client'

import { useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import Link from 'next/link'
import { InfoCard } from '../cards'
import { ErrorMessageBlock } from '../Errors'
import { Identifier } from '../data'
import { Slider, SliderElement } from '../ui/Slider'
import { WheelControls } from '../ui/Slider/plugins'
import { TickerBadge } from './index'
import './TokenDashboardCards.scss'
import './TokenDashboardCard.scss'

function TokenDashboardCard ({ token, className, loading = false }) {
  return (
    <InfoCard className={`TokenDashboardCard ${className || ''}`} loading={loading} clickable={true}>
      {!loading
        ? <Link href={`/token/${token?.identifier}`}>
          <Flex mb={1} gap={'0.75rem'} alignItems={'center'}>
            <div className={'TokenDashboardCard__Name'}>{token?.name}</div>
            {token?.ticker &&
              <TickerBadge>
                {token.ticker}
              </TickerBadge>
            }
          </Flex>
          <Identifier className={'TokenDashboardCard__Id'} ellipsis={true} styles={['highlight-both']}>{token.identifier}</Identifier>
        </Link>
        : <Box h={'55px'}/>
      }
    </InfoCard>
  )
}

function TokenDashboardCards ({ items, className }) {
  const [sliderLoaded, setSliderLoaded] = useState(false)

  const chunkArray = (array, chunkSize) => {
    const result = []
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize))
    }
    return result
  }

  const columns = chunkArray(items?.data?.resultSet, 3)

  return (
    !items.error
      ? <div className={`TokenDashboardCards ${className || ''}`}>
        <Slider
          className={'TokenDashboardCards__Slider'}
          settings={{
            rubberband: false,
            renderMode: 'performance',
            breakpoints: {
              '(max-width: 48em)': {
                slides: {
                  origin: 'center',
                  perView: 1.1
                }
              }
            },
            slides: { perView: 2 }
          }}
          createdCallback={() => setSliderLoaded(true)}
          plugins={[WheelControls]}
        >
          {columns.map((column, columnIndex) => (
            <SliderElement className={'TokenDashboardCards__CardsColumn'} key={columnIndex} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {column.map((token, i) => (
                <TokenDashboardCard
                  className={'TokenDashboardCards__Card'}
                  token={token}
                  loading={!sliderLoaded}
                  key={i}
                />
              ))}
            </SliderElement>
          ))}
        </Slider>
      </div>
      : <ErrorMessageBlock h={250}/>
  )
}

export {
  TokenDashboardCards
}
