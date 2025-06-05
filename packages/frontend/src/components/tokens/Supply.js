'use client'

import { Progress } from '@chakra-ui/react'
import './Supply.scss'

function Supply ({ currentSupply, maxSupply, className, progressPosition = 'bottom' }) {
  const progressClass = progressPosition === 'top' ? 'Supply--ProgressTop' : ''

  return (
    <div className={`Supply ${progressClass} ${className || ''}`}>
      <div className={'Supply__Titles'}>
        <span className={'Supply__CurrentSupply'}>{currentSupply}</span>
        <span className={'Supply__MaxSupply'}>{maxSupply}</span>
      </div>
      <Progress
        className={'Supply__Progress'}
        value={(parseInt(currentSupply.replace(/\D/g, '')) / parseInt(maxSupply.replace(/\D/g, ''))) * 100}
        height={'1px'}
        width={'9rem'}
        colorScheme={'gray'}
      />
    </div>
  )
}

export default Supply
