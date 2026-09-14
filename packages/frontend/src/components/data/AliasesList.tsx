'use client'

import { useState } from 'react'
import type { Alias as AliasModel } from '../../types'
import { Alias, DateBlock } from './index'
import { ChevronIcon } from '../ui/icons'
import { SmoothSize } from '../ui/containers'
import './AliasesList.css'

interface AliasesListProps {
  aliases?: Array<Pick<AliasModel, 'alias' | 'status'> & { timestamp?: string | number | null }>
  smallCount?: number
}

function AliasesList({ aliases = [], smallCount = 5 }: AliasesListProps) {
  const [showAll, setShowAll] = useState(false)

  const filteredArray = showAll ? aliases : aliases.filter((item, i) => i < smallCount)

  return (
    <div className={'AliasesList'}>
      <SmoothSize className={'AliasesList__SmoothSize'}>
        <div className={'AliasesList__ItemsContainer'}>
          {filteredArray?.map((alias, i) => (
            <div className={'AliasesList__Item'} key={i}>
              <Alias status={alias.status} ellipsis={false} key={i}>
                {alias.alias}
              </Alias>
              {alias?.timestamp && <DateBlock timestamp={alias.timestamp} format={'deltaOnly'} />}
            </div>
          ))}
        </div>
      </SmoothSize>

      {aliases.length > smallCount && (
        <button
          type={'button'}
          onClick={() => setShowAll(!showAll)}
          className={`AliasesList__ShowMoreButton ${showAll ? 'AliasesList__ShowMoreButton--Less' : ''}`}
        >
          {showAll ? 'Show less' : 'Show more'}
          <ChevronIcon
            className={`AliasesList__Chevron ${showAll ? 'AliasesList__Chevron--Up' : ''}`}
          />
        </button>
      )}
    </div>
  )
}

export default AliasesList
