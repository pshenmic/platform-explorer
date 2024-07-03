'use client'

import { Flex, Box } from '@chakra-ui/react'
import Link from 'next/link'
import { CardsGrid, CardsGridItems, CardsGridItem, CardsGridHeader, CardsGridTitle } from '../cards'
import { ErrorMessageBlock } from '../Errors'
import ImageGenerator from '../imageGenerator'
import './DataContractCard.scss'

function DataContractCard ({ dataContract, loading = false }) {
  return (
    <CardsGridItem className={'DataContractCard'} loading={loading} clickable={true}>
      {!loading
        ? <Link href={`/dataContract/${dataContract.identifier}`}>
          <Flex mb={1} alignItems={'center'}>
            <div className={'DataContractCard__Img'}>
              <ImageGenerator username={dataContract.identifier} lightness={50} saturation={50} width={28} height={28}/>
            </div>
            <div className={'DataContractCard__Name'}>{dataContract.name}</div>
          </Flex>
          <div className={'DataContractCard__Id'}>{dataContract.identifier}</div>
        </Link>
        : <Box h={'55px'}/>
      }
    </CardsGridItem>
  )
}

function DataContractCards ({ title, items, className }) {
  return (
    !items.error
      ? <CardsGrid className={className} itemsCount={items?.data?.resultSet?.length || null}>
          {title &&
            <CardsGridHeader>
              <CardsGridTitle>{title}</CardsGridTitle>
            </CardsGridHeader>
          }

          <CardsGridItems>
            {!items.loading
              ? items?.data?.resultSet?.length
                ? items.data.resultSet.map((dataContract, i) => <DataContractCard dataContract={dataContract} key={i}/>)
                : <ErrorMessageBlock h={250} text={'Data Contracts not found'}/>
              : Array.from({ length: 4 }, (x, i) => <DataContractCard loading={true} key={i}/>)
            }
          </CardsGridItems>
        </CardsGrid>
      : <ErrorMessageBlock h={250}/>
  )
}

export {
  DataContractCards
}
