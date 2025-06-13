'use client'

import { Progress } from '@chakra-ui/react'
import { BigNumber } from '../data'
import './Supply.scss'

function Supply ({
  currentSupply,
  maxSupply,
  className,
  progressPosition = 'bottom',
  showTitles = false,
  showIcons = false,
  minTitle = <>Minted</>,
  maxTitle = <>Total<br/>Supply</>,
  topIcon,
  bottomIcon
}) {
  const progressClass = progressPosition === 'top' ? 'Supply--ProgressTop' : ''

  return (
    <div className={`Supply ${progressClass} ${showTitles && 'Supply--WithIcons'} ${className || ''}`}>
      <div className={'Supply__ContentWrapper'}>
        {/* Top title with icon */}
        {showTitles && (
          <div className={'Supply__Title'}>
            {showIcons && topIcon}
            <span className={'Supply__TitleText'}>{minTitle}</span>
          </div>
        )}

        <div className={'Supply__ProgressContainer'}>
          <div className={'Supply__SupplyTitles'}>
            <span className={'Supply__CurrentSupply'}><BigNumber>{currentSupply}</BigNumber></span>
            <span className={'Supply__MaxSupply'}><BigNumber>{maxSupply}</BigNumber></span>
          </div>

          <Progress
            className={'Supply__Progress'}
            value={(Number(currentSupply) / Number(maxSupply)) * 100}
            height={'1px'}
            width={'100%'}
            colorScheme={'gray'}
          />
        </div>

        {showTitles && (
          <div className={'Supply__Title'}>
            <span className={'Supply__TitleText'}>{maxTitle}</span>
            {showIcons && bottomIcon}
          </div>
        )}
      </div>
    </div>
  )
}

export default Supply
