'use client'

import { SideBlock } from '../containers'
import { Flex } from '@chakra-ui/react'
import { CardsGrid, CardsGridItems, CardsGridItem, CardsGridHeader, CardsGridTitle } from '../cards'
import './DataContractCard.scss'

const contracts = [
  {
    name: 'Alice.dash',
    id: 'B866247CC65C2D7C671EAD9A3D25B499B42A058E58AAF9ACDADE625C9FAA90FB'
  },
  {
    name: 'Alice.dash',
    id: 'B866247CC65C2D7C671EAD9A3D25B499B42A058E58AAF9ACDADE625C9FAA90FB'
  },
  {
    name: 'Alice.dash',
    id: 'B866247CC65C2D7C671EAD9A3D25B499B42A058E58AAF9ACDADE625C9FAA90FB'
  },
  {
    name: 'Alice.dash',
    id: 'B866247CC65C2D7C671EAD9A3D25B499B42A058E58AAF9ACDADE625C9FAA90FB'
  }
]

export default function TopDataContracts () {
  return (
    <SideBlock>
        <CardsGrid>
          <CardsGridHeader>
            <CardsGridTitle>Top Contracts:</CardsGridTitle>
          </CardsGridHeader>

          <CardsGridItems>
            {contracts.map((contract, i) => (
              <CardsGridItem className={'DataContractCard'} key={i}>
                <Flex mb={1} alignItems={'center'}>
                  <div className={'DataContractCard__Img'}></div>
                  <div className={'DataContractCard__Name'}>{contract.name}</div>
                </Flex>
                <div className={'DataContractCard__Id'}>{contract.id}</div>
              </CardsGridItem>
            ))}
          </CardsGridItems>
        </CardsGrid>
    </SideBlock>
  )
}
