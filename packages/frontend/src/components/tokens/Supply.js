'use client'

import { Progress } from '@chakra-ui/react'
import { BigNumber } from '../data'
import { currencyRound } from '../../util'
import { Tooltip } from '../ui/Tooltips'
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
  const tooBigNumber = Number(maxSupply) > 9999999999999

  return (
    <div className={`Supply ${progressClass} ${showTitles && 'Supply--WithIcons'} ${className || ''}`}>
      <div className={'Supply__ContentWrapper'}>
        {showTitles && (
          <div className={'Supply__Title'}>
            {showIcons && topIcon}
            <span className={'Supply__TitleText'}>{minTitle}</span>
          </div>
        )}

        <div className={'Supply__ProgressContainer'}>
          <div className={'Supply__SupplyTitles'}>
            <span className={'Supply__CurrentSupply'}>
              {tooBigNumber
                ? <Tooltip
                    placement={'top'}
                    content={<BigNumber>{Number(currentSupply)}</BigNumber>}
                  >
                    <span>{currencyRound(currentSupply)}</span>
                  </Tooltip>
                : <BigNumber>{Number(currentSupply)}</BigNumber>
              }
            </span>
            <span className={'Supply__MaxSupply'}>
              {tooBigNumber
                ? <Tooltip
                    placement={'top'}
                    content={<BigNumber>{Number(maxSupply)}</BigNumber>}
                  >
                    <span>{currencyRound(maxSupply)}</span>
                  </Tooltip>
                : <BigNumber>{Number(maxSupply)}</BigNumber>
              }
            </span>
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
