'use client'

import { Progress } from '@chakra-ui/react'
import { BigNumber } from '../data'
import './Supply.scss'

function Supply ({ currentSupply, maxSupply, className, progressPosition = 'bottom' }) {
  const progressClass = progressPosition === 'top' ? 'Supply--ProgressTop' : ''

  return (
    <div className={`Supply ${progressClass} ${className || ''}`}>
      <div className={'Supply__Titles'}>
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
  )
}

export default Supply
