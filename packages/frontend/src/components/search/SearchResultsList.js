import './SearchResultsList.scss'
import { Alias, Identifier } from '../data'
import { Badge } from '@chakra-ui/react'

function SearchResultsList ({ results }) {
  console.log('result', results)

  return (
    <div>
      {results?.identities?.length &&
        <div>
          <div className={'SearchResultsList__Title'}>
            {results?.identities?.length} identities found
          </div>
          <div>
            {results?.identities.map((identity, i) => (
              <div className={'SearchResultsList__Item'} key={i}>

                {identity?.alias
                  ? <Alias>{identity?.alias}</Alias>
                  : <Identifier styles={['highlight-both']}>{identity?.identifier}</Identifier>
                }

                <div>
                  <Badge size={'xs'} colorScheme={
                    ({
                      ok: 'green',
                      pending: 'orange',
                      locked: 'red'
                    })?.[identity?.status?.status] || 'gray'
                  }>
                    {identity?.status?.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    </div>
  )
}

export default SearchResultsList
