import { useState } from 'react'
import { Alias } from '../../../components/data'

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
      <div className={'AliasesList__ShowMoreButton'} onClick={() => setShowAll(!showAll)}>
        {showAll ? 'Show less' : 'Show more'}
      </div>
    </div>
  )
}

export default AliasesList
