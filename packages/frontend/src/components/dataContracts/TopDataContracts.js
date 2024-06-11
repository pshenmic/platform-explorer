'use client'

import * as Api from '../../util/Api'
import { SideBlock } from '../containers'
import { useState, useEffect } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import Link from 'next/link'
import { CardsGrid, CardsGridItems, CardsGridItem, CardsGridHeader, CardsGridTitle } from '../cards'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { ErrorMessageBlock } from '../Errors'
import ImageGenerator from '../imageGenerator'
import './DataContractCard.scss'

function Item ({ dataContract, loading = false }) {
  return (
    <CardsGridItem className={'DataContractCard'} loading={loading} clickable={true}>
      {!loading
        ? <Link href={`/dataContract/${dataContract.identifier}`}>
          <Flex mb={1} alignItems={'center'}>
            <div className={'DataContractCard__Img'}>
              <ImageGenerator username={dataContract.identifier} lightness={50} saturation={50} width={28} height={28}/>
            </div>
            <div className={'DataContractCard__Name'}>Alice.dash</div>
          </Flex>
          <div className={'DataContractCard__Id'}>{dataContract.identifier}</div>
        </Link>
        : <Box h={'55px'}/>
      }
    </CardsGridItem>
  )
}

export default function TopDataContracts () {
  const [dataContracts, setDataContracts] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getDataContracts(1, 4, 'desc', 'documents_count')
      .then(res => fetchHandlerSuccess(setDataContracts, res))
      .catch(err => fetchHandlerError(setDataContracts, err))
  }

  useEffect(fetchData, [])

  return (
    <SideBlock>
        {!dataContracts.error
          ? <>
              <CardsGrid>
                <CardsGridHeader>
                  <CardsGridTitle>Top Contracts:</CardsGridTitle>
                </CardsGridHeader>

                <CardsGridItems>
                  {!dataContracts.loading
                    ? dataContracts?.data?.resultSet?.length
                      ? dataContracts.data.resultSet.map((dataContract, i) => <Item dataContract={dataContract} key={i}/>)
                      : <ErrorMessageBlock h={250} text={'Data Contracts not found'}/>
                    : Array.from({ length: 4 }, (x, i) => <Item loading={true} key={i}/>)
                  }
                </CardsGridItems>
              </CardsGrid>
            </>
          : <ErrorMessageBlock h={250}/>
        }
    </SideBlock>
  )
}
