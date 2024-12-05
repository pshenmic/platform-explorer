import { useState } from 'react'
import { Alias } from '../../../components/data'
import { Button } from '@chakra-ui/react'

function AliasesList ({ aliases = [], smallCount = 5 }) {
  const [showAll, setShowAll] = useState(false)

  const filteredArray = showAll
    ? aliases
    : aliases.filter((item, i) => i < smallCount)

  return (
    <div className={'AliasesList'}>
      <div className={'AliasesList__ItemsContainer'}>
        {filteredArray?.map((alias, i) => (
          <Alias status={alias.status} key={i}>{alias.alias}</Alias>
        ))}
      </div>
      <Button
        onClick={() => setShowAll(!showAll)}
        className={'AliasesList__ShowMoreButton'}
        size={'sm'}
        colorScheme={showAll ? 'gray' : 'blue'}
      >
        {showAll ? 'Show less' : 'Show more'}
      </Button>
    </div>
  )
}

export default AliasesList
