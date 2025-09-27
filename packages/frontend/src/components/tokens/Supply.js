'use client'

import { Progress } from '@chakra-ui/react'
import { BigNumber } from '../data'
import { LoadingLine } from '../loading'
import { currencyRound } from '../../util'
import { Tooltip } from '../ui/Tooltips'
import './Supply.scss'
import { formatNumberByDecimals } from '../../util/numbers'

function Supply ({
  currentSupply,
  maxSupply,
  className,
  decimals,
  progressPosition = 'bottom',
  showTitles = false,
  showIcons = false,
  minTitle = <>Minted</>,
  maxTitle = <>Total<br/>Supply</>,
  topIcon,
  bottomIcon,
  loading
}) {
  const progressClass = progressPosition === 'top' ? 'Supply--ProgressTop' : ''
  const isTooBigNumber = (number) => Number(number) > 999999999
  const hasMaxSupply = maxSupply && Number(maxSupply) > 0

  const displayFormatCurrentSupply = formatNumberByDecimals(currentSupply, decimals)
  const displayFormatMaxSupply = formatNumberByDecimals(maxSupply, decimals)

  return (
    <div className={`Supply ${progressClass || ''} ${showTitles && 'Supply--WithIcons'} ${className || ''} ${loading ? 'Supply--Loading' : ''}`}>
      <div className={'Supply__ContentWrapper'}>
        {showTitles && (
          <div className={'Supply__Title'}>
            {showIcons && topIcon}
            <span className={'Supply__TitleText'}>{minTitle}{(!hasMaxSupply && !loading) && ':'}</span>
          </div>
        )}

        <div className={`Supply__ProgressContainer ${!hasMaxSupply ? 'Supply__ProgressContainer--Single' : ''}`}>
          {loading
            ? <LoadingLine w='100%' h={'20px'}/>
            : <>
                <div className={'Supply__SupplyTitles'}>
                  <span className={'Supply__CurrentSupply'}>
                    {isTooBigNumber(displayFormatCurrentSupply)
                      ? <Tooltip
                          placement={'top'}
                          content={<BigNumber>{displayFormatCurrentSupply}</BigNumber>}
                        >
                          <span>{currencyRound(displayFormatCurrentSupply)}</span>
                        </Tooltip>
                      : <BigNumber>{displayFormatCurrentSupply}</BigNumber>
                    }
                  </span>
                  {hasMaxSupply && (
                    <span className={'Supply__MaxSupply'}>
                      {isTooBigNumber(maxSupply)
                        ? <Tooltip
                            placement={'top'}
                            content={<BigNumber>{displayFormatMaxSupply}</BigNumber>}
                          >
                            <span>{currencyRound(displayFormatMaxSupply)}</span>
                          </Tooltip>
                        : <BigNumber>{displayFormatMaxSupply}</BigNumber>
                      }
                    </span>
                  )}
                </div>
                {hasMaxSupply && (
                  <Progress
                    className={'Supply__Progress'}
                    value={(Number(currentSupply) / Number(maxSupply)) * 100}
                    height={'1px'}
                    width={'100%'}
                    colorScheme={'gray'}
                  />
                )}
              </>
          }
        </div>

        {showTitles && (loading || hasMaxSupply) && (
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
