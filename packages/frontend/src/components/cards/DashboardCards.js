'use client'

import './InfoCard.scss'
import { Slider, SliderElement } from '../ui/Slider'
import { WheelControls } from '../ui/Slider/plugins'
import DashboardCard from './DashboardCard'
import './DashboardCards.scss'

const Columns = ({ cards, columnLayout }) => {
  const columns = []
  let cardIndex = 0

  for (let i = 0; i < columnLayout.length; i++) {
    const cardsInColumn = []

    for (let j = 0; j < columnLayout[i] && cardIndex < cards.length; j++) {
      cardsInColumn.push(cards[cardIndex])
      cardIndex++
    }

    columns.push(
      <SliderElement className={'DashboardCards__CardsColumn'} key={i}>
        {cardsInColumn.map((card, idx) => (
          <DashboardCard card={card} key={idx}/>
        ))}
      </SliderElement>
    )
  }

  return columns
}

export default function DashboardCards ({
  cards = [],
  columnLayout = [2, 2],
  sliderMode = 'responsive', // 'responsive', 'always', 'never'
  breakpoint = 600, // pixel width where slider becomes active in responsive mode
  perView = {
    mobile: 1.1,
    desktop: 2
  },
  className = ''
}) {
  if (sliderMode === 'never') {
    return (
      <div className={`DashboardCards DashboardCards--NoSlider ${className}`}>
        <div className='DashboardCards__Grid'>
          {cards.map((card, index) => (
            <DashboardCard card={card} key={index}/>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`DashboardCards ${sliderMode === 'always' ? 'DashboardCards--AlwaysSlider' : ''} ${className}`}>
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
        plugins={[WheelControls]}
      >
        <Columns cards={cards} columnLayout={columnLayout}/>
      </Slider>
    </div>
  )
}
