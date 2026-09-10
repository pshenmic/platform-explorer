'use client'

import { useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { InfoCard } from '../cards'
import { ErrorMessageBlock } from '../Errors'
import ImageGeneratorJs from '../imageGenerator'
import { Identifier as IdentifierJs } from '../data'
import { Slider, SliderElement } from '../ui/Slider'
import { WheelControls } from '../ui/Slider/plugins'
import type { KeenSliderPlugin } from 'keen-slider/react'
import type { DataContract, LoadableState, PaginatedResultSet, WithClassName } from '../../types'
import './DataContractCard.css'
import './DataContractCards.css'

// Untyped JS components — loose wrappers until data/* / imageGenerator are migrated
const ImageGenerator = ImageGeneratorJs as ComponentType<{
  username?: string | null
  className?: string
  lightness?: number
  saturation?: number
  width?: number
  height?: number
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
}>

interface DataContractCardProps extends WithClassName {
  dataContract: Pick<DataContract, 'identifier' | 'name'>
  loading?: boolean
}

function DataContractCard ({ dataContract, className, loading = false }: DataContractCardProps) {
  return (
    <InfoCard
      className={`DataContractCard ${className || ''}`}
      loading={loading}
      link={!loading ? `/dataContract/${dataContract.identifier}` : undefined}
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

interface DataContractCardsProps extends WithClassName {
  items: LoadableState<PaginatedResultSet<DataContract>> | {
    data?: PaginatedResultSet<DataContract> | null
    error?: unknown
  }
}

function DataContractCards ({ items, className }: DataContractCardsProps) {
  const [sliderLoaded, setSliderLoaded] = useState(false)

  const chunkArray = <T, >(array: T[] | undefined, chunkSize: number): T[][] => {
    const result: T[][] = []
    if (!array) return result
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
            plugins={[WheelControls as unknown as KeenSliderPlugin]}
          >
            {columns.map((column, columnIndex) => (
              <SliderElement className={'DataContractCards__CardsColumn'} key={columnIndex}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {column.map((dataContract, i) => (
                    <DataContractCard
                      className={'DataContractCards__Card'}
                      dataContract={dataContract}
                      loading={!sliderLoaded}
                      key={i}
                    />
                  ))}
                </div>
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
