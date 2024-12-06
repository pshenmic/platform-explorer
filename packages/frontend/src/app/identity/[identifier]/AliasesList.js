import { useState } from 'react'
import { Alias, DateBlock } from '../../../components/data'
import { Button } from '@chakra-ui/react'
import './AliasesList.scss'

function AliasesList ({ aliases = [], smallCount = 5 }) {
  const [showAll, setShowAll] = useState(false)

  const filteredArray = showAll
    ? aliases
    : aliases.filter((item, i) => i < smallCount)

  return (
    <div className={'AliasesList'}>
      <div className={'AliasesList__ItemsContainer'}>
        {filteredArray?.map((alias, i) => (
          <div className={'AliasesList__Item'} key={i}>
            <Alias status={alias.status} key={i}>{alias.alias}</Alias>
            <DateBlock timestamp={1233123333332} format={'deltaOnly'}/>
          </div>
        ))}
      </div>
      <Button
        onClick={() => setShowAll(!showAll)}
        className={'AliasesList__ShowMoreButton'}
        size={'sm'}
        variant={showAll ? 'gray' : 'blue'}
      >
        {showAll ? 'Show less' : 'Show more'}
      </Button>
    </div>
  )
}

export default AliasesList
