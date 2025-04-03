'use client'

import { Slider, SliderElement } from '../ui/Slider'
import { WheelControls } from '../ui/Slider/plugins'
import DashboardCard from './DashboardCard'
import './DashboardCards.scss'
import './InfoCard.scss'

/**
 * Helper function to arrange cards into columns for the slider
 *
 * @param {Array} cards - Array of card objects to arrange
 * @param {Array<number>} columnLayout - Layout configuration for columns
 * @returns {Array<React.ReactElement>} Array of SliderElement components
 * @private
 */
const renderColumns = (cards, columnLayout) => {
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

/**
 * DashboardCards component displays cards in a slider or grid layout
 *
 * @param {Object} props
 * @param {Array<Object>} props.cards - Array of card objects to display
 * @param {Array<number>} [props.columnLayout=[2,2]] - How many cards per column in slider mode
 * @param {'responsive'|'always'|'never'} [props.sliderMode='responsive'] - Slider behavior mode
 * @param {number} [props.breakpoint=600] - Screen width breakpoint for responsive mode
 * @param {Object} [props.perView] - Slides visible in viewport configuration
 * @param {number} [props.perView.mobile=1.1] - Slides visible on mobile
 * @param {number} [props.perView.desktop=2] - Slides visible on desktop
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element}
 */
export default function DashboardCards ({
  cards = [],
  columnLayout = [2, 2],
  sliderMode = 'responsive', /** 'responsive', 'always', 'never' */
  breakpoint = 600,
  perView = {
    mobile: 1.1,
    desktop: 2
  },
  className = ''
}) {
  return sliderMode === 'never'
    ? <div className={`DashboardCards DashboardCards--NoSlider ${className}`}>
        <div className='DashboardCards__Grid'>
          {cards.map((card, index) => (
            <DashboardCard card={card} key={index}/>
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
          plugins={[WheelControls]}
        >
          {renderColumns(cards, columnLayout)}
        </Slider>
      </div>
}
