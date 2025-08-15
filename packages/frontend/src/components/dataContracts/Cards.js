'use client'

import { useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { InfoCard } from '../cards'
import { ErrorMessageBlock } from '../Errors'
import ImageGenerator from '../imageGenerator'
import { Identifier } from '../data'
import { Slider, SliderElement } from '../ui/Slider'
import { WheelControls } from '../ui/Slider/plugins'
import './DataContractCard.scss'
import './DataContractCards.scss'

function DataContractCard ({ dataContract, className, loading = false }) {
  return (
    <InfoCard
      className={`DataContractCard ${className || ''}`}
      loading={loading}
      link={!loading ? `/dataContract/${dataContract.identifier}` : null}
      clickable={true}
    >
      {!loading
        ? <div>
            <Flex mb={1} alignItems={'center'}>
              <div className={'DataContractCard__Img'}>
                <ImageGenerator username={dataContract.identifier} lightness={50} saturation={50} width={28} height={28}/>
              </div>
              <div className={'DataContractCard__Name'}>{dataContract.name}</div>
            </Flex>
            <Identifier className={'DataContractCard__Id'} ellipsis={true} styles={['highlight-both']}>{dataContract.identifier}</Identifier>
          </div>
        : <Box h={'55px'}/>
      }
    </InfoCard>
  )
}

function DataContractCards ({ items, className }) {
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
      ? <div className={`DataContractCards ${className || ''}`}>
          <Slider
            className={'DataContractCards__Slider'}
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
              <SliderElement className={'DataContractCards__CardsColumn'} key={columnIndex} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {column.map((dataContract, i) => (
                  <DataContractCard
                    className={'DataContractCards__Card'}
                    dataContract={dataContract}
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
  DataContractCards
}
