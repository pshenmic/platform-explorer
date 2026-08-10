'use client'

import type { KeenSliderPlugin } from 'keen-slider/react'
import { Slider, SliderElement } from '../ui/Slider'
import { WheelControls } from '../ui/Slider/plugins'
import type { WithClassName } from '../../types/common'
import DashboardCard from './DashboardCard'
import type { DashboardCardData } from './DashboardCard'
import './DashboardCards.scss'
import './InfoCard.scss'

type SliderMode = 'responsive' | 'always' | 'never'

interface PerViewConfig {
  mobile?: number
  desktop?: number
}

interface DashboardCardsProps extends WithClassName {
  cards?: DashboardCardData[]
  columnLayout?: number[]
  sliderMode?: SliderMode
  breakpoint?: number
  perView?: PerViewConfig
}

/**
 * DashboardCards component displays cards in a slider or grid layout
 */
export default function DashboardCards ({
  cards = [],
  columnLayout = [2, 2],
  sliderMode = 'responsive',
  breakpoint = 600,
  perView = {
    mobile: 1.1,
    desktop: 2
  },
  className = ''
}: DashboardCardsProps) {
  const renderColumns = (cardsList: DashboardCardData[], layout: number[]) => {
    if (!cardsList || !layout?.length) return null

    const columns = []
    let cardIndex = 0

    for (let i = 0; i < layout.length; i++) {
      const cardsInColumn: DashboardCardData[] = []

      for (let j = 0; j < layout[i] && cardIndex < cardsList.length; j++) {
        cardsInColumn.push(cardsList[cardIndex])
        cardIndex++
      }

      columns.push(
        <SliderElement className={'DashboardCards__CardsColumn'} key={i}>
          {cardsInColumn.map((card, idx) => (
            <DashboardCard className={`DashboardCards__Card ${card?.className || ''}`} card={card} key={idx}/>
          ))}
        </SliderElement>
      )
    }

    return columns
  }

  return sliderMode === 'never'
    ? <div className={`DashboardCards DashboardCards--NoSlider ${className}`}>
        <div className='DashboardCards__Grid'>
          {cards.map((card, index) => (
            <DashboardCard className={'DashboardCards__Card'} card={card} key={index}/>
          ))}
        </div>
      </div>
    : <div className={`DashboardCards slider-container ${sliderMode === 'always' ? 'DashboardCards--AlwaysSlider' : ''} ${className}`}>
        <Slider
          className={'DashboardCards__Slider'}
          settings={{
            rubberband: false,
            renderMode: 'performance',
            breakpoints: {
              [`(min-width: ${breakpoint}px)`]: {
                slides: { perView: perView.desktop }
              }
            },
            slides: {
              origin: 'center',
              perView: perView.mobile
            }
          }}
          plugins={[WheelControls as unknown as KeenSliderPlugin]}
        >
          {renderColumns(cards, columnLayout)}
        </Slider>
      </div>
}
