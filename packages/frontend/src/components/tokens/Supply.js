'use client'

import { Progress } from '@chakra-ui/react'
import { BigNumber } from '../data'
import { LoadingLine } from '../loading'
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
  bottomIcon,
  loading
}) {
  const progressClass = progressPosition === 'top' ? 'Supply--ProgressTop' : ''
  const tooBigNumber = Number(maxSupply) > 9999999999999
  const hasMaxSupply = maxSupply && Number(maxSupply) > 0 && Number(maxSupply) !== Number(currentSupply)
  const tooBigCurrentNumber = Number(currentSupply) > 9999999999999

  return (
    <div className={`Supply ${progressClass} ${showTitles && 'Supply--WithIcons'} ${className || ''} ${loading ? 'Supply--Loading' : ''}`}>
      <div className={'Supply__ContentWrapper'}>
        {showTitles && (
          <div className={'Supply__Title'}>
            {showIcons && topIcon}
            <span className={'Supply__TitleText'}>{minTitle}{!hasMaxSupply && ':'}</span>
          </div>
        )}

        {hasMaxSupply || loading
          ? <div className={'Supply__ProgressContainer'}>
              {loading
                ? <LoadingLine w='100%' h={'20px'}/>
                : <>
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
                </>
              }
            </div>
          : <div className={'Supply__SimpleValue'}>
              {loading
                ? <LoadingLine w={'100%'} h={'20px'}/>
                : <>
                  {tooBigCurrentNumber
                    ? <Tooltip
                        placement={'top'}
                        content={<BigNumber>{Number(currentSupply)}</BigNumber>}
                      >
                        <span>{currencyRound(currentSupply)}</span>
                      </Tooltip>
                    : <BigNumber>{Number(currentSupply)}</BigNumber>
                  }
                </>
              }
            </div>
        }

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
