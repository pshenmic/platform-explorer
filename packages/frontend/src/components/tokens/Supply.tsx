'use client'

import type { ReactNode } from 'react'
import { Progress } from '@chakra-ui/react'
import { LoadingLine } from '../loading'
import { FormattedNumber } from '../ui/FormattedNumber'
import type { WithClassName } from '../../types/common'

import './Supply.css'

interface SupplyProps extends WithClassName {
  currentSupply?: string | number | null
  maxSupply?: string | number | null
  decimals?: number | null
  progressPosition?: 'top' | 'bottom'
  showTitles?: boolean
  showIcons?: boolean
  minTitle?: ReactNode
  maxTitle?: ReactNode
  topIcon?: ReactNode
  bottomIcon?: ReactNode
  loading?: boolean
}

function Supply({
  currentSupply,
  maxSupply,
  className,
  decimals,
  progressPosition = 'bottom',
  showTitles = false,
  showIcons = false,
  minTitle = <>Minted</>,
  maxTitle = (
    <>
      Total
      <br />
      Supply
    </>
  ),
  topIcon,
  bottomIcon,
  loading
}: SupplyProps) {
  const progressClass = progressPosition === 'top' ? 'Supply--ProgressTop' : ''
  const hasMaxSupply = maxSupply != null && Number(maxSupply) > 0

  return (
    <div
      className={`Supply ${progressClass || ''} ${showTitles && 'Supply--WithIcons'} ${className || ''} ${loading ? 'Supply--Loading' : ''}`}
    >
      <div className={'Supply__ContentWrapper'}>
        {showTitles && (
          <div className={'Supply__Title'}>
            {showIcons && topIcon}
            <span className={'Supply__TitleText'}>
              {minTitle}
              {!hasMaxSupply && !loading && ':'}
            </span>
          </div>
        )}

        <div
          className={`Supply__ProgressContainer ${!hasMaxSupply ? 'Supply__ProgressContainer--Single' : ''}`}
        >
          {loading ? (
            <LoadingLine w="100%" h={'20px'} />
          ) : (
            <>
              <div className={'Supply__SupplyTitles'}>
                <FormattedNumber
                  decimals={decimals ?? undefined}
                  className={'Supply__CurrentSupply'}
                >
                  {currentSupply}
                </FormattedNumber>
                {maxSupply != null && (
                  <FormattedNumber decimals={decimals ?? undefined} className={'Supply__MaxSupply'}>
                    {maxSupply}
                  </FormattedNumber>
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
          )}
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
