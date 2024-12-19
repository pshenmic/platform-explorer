'use client'

import { useState } from 'react'
import { Alias, DateBlock } from './index'
import { Button } from '@chakra-ui/react'
import { ChevronIcon } from '../ui/icons'
import { SmoothSize } from '../ui/containers'
import './AliasesList.scss'

function AliasesList ({ aliases = [], smallCount = 5 }) {
  const [showAll, setShowAll] = useState(false)

  const filteredArray = showAll
    ? aliases
    : aliases.filter((item, i) => i < smallCount)

  return (
    <div className={'AliasesList'}>
      <SmoothSize className={'AliasesList__SmoothSize'}>
        <div className={'AliasesList__ItemsContainer'}>
          {filteredArray?.map((alias, i) => (
            <div className={'AliasesList__Item'} key={i}>
              <Alias status={alias.status} ellipsis={false} key={i}>{alias.alias}</Alias>
              {alias?.timestamp && <DateBlock timestamp={alias.timestamp} format={'deltaOnly'}/>}
            </div>
          ))}
        </div>
      </SmoothSize>

      {aliases.length > smallCount &&
        <Button
          onClick={() => setShowAll(!showAll)}
          className={'AliasesList__ShowMoreButton'}
          size={'sm'}
          variant={showAll ? 'gray' : 'blue'}
        >
          {showAll ? 'Show less' : 'Show more'}
          <ChevronIcon ml={'4px'} h={'10px'} w={'10px'} transform={`rotate(${showAll ? '-90deg' : '90deg'})`}/>
        </Button>
      }
    </div>
  )
}

export default AliasesList
