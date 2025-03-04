import { Alias, Identifier } from '../data'
import { Badge, Button } from '@chakra-ui/react'
import { ChevronIcon } from '../ui/icons'
import './SearchResultsList.scss'
import './SearchResultsListItem.scss'

function SearchResultsList ({ results }) {
  console.log('result', results)

  return (
    <div>
      {results?.identities?.length &&
        <div className={'SearchResultsList__Category'}>
          <div className={'SearchResultsList__Title'}>
            {results?.identities?.length} identities found
          </div>
          <div>
            {results?.identities.map((identity, i) => (
              <div className={'SearchResultsList__Item SearchResultsListItem'} key={i}>

                {identity?.alias
                  ? <Alias avatarSource={identity?.identifier}>{identity?.alias}</Alias>
                  : <Identifier avatar={true} styles={['highlight-both']}>{identity?.identifier}</Identifier>
                }

                {identity?.status?.status &&
                  <Badge size={'xs'} colorScheme={
                    ({
                      ok: 'green',
                      pending: 'orange',
                      locked: 'red'
                    })?.[identity?.status?.status] || 'gray'
                  }>
                    {identity?.status?.status}
                  </Badge>
                }

                <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
                  <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
                </Button>
              </div>
            ))}
          </div>
        </div>
      }
    </div>
  )
}

export default SearchResultsList
