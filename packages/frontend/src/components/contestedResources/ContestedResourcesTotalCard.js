import {Alias, Identifier, InfoLine} from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { SignatureIcon } from '../ui/icons'
import './ContestedResourcesTotalCard.scss'
import contestedResources from '../../util/contestedResources'
import {ValueCard} from "../cards";
import {Badge} from "@chakra-ui/react";

function ContestedResourcesTotalCard ({ contestedResource, className }) {
  // contestedResources.getResourceValue(contestedResource?.resourceValue)
  const { data, loading, error } = contestedResource

  console.log('contestedResource > ', contestedResource)

  return (
    <div className={`InfoBlock InfoBlock--Gradient ContestedResourcesTotalCard ${contestedResource?.loading ? 'ContestedResourcesTotalCard--Loading' : ''} ${className || ''}`}>
      <div className={'ContestedResourcesTotalCard__Title'}>
        <Alias>{contestedResources.getResourceValue(data?.resourceValue)}</Alias>
      </div>

      <div className={'ContestedResourcesTotalCard__Header'}>
        <div className={'ContestedResourcesTotalCard__HeaderLines'}>
          <InfoLine
            className={'ContestedResourcesTotalCard__InfoLine--Hash'}
            title={'Index Value'}
            loading={false}
            error={false}
            value={
              <Alias>{contestedResources.getResourceValue(contestedResource?.data?.resourceValue)}</Alias>
            }
          />

          <InfoLine
            className={'ContestedResourcesTotalCard__InfoLine'}
            title={'Data Contract'}
            loading={false}
            error={false}
            value={
              <ValueCard link={`/dataContract/${data?.dataContractIdentifier}`}>
                <Identifier
                  styles={['highlight-both']}
                  ellipsis={false}
                  avatar={true}
                >
                  {data?.dataContractIdentifier}
                </Identifier>
              </ValueCard>
            }
          />

          <InfoLine
            className={'ContestedResourcesTotalCard__InfoLine'}
            title={'Index Name'}
            loading={false}
            error={false}
            value={
              data?.indexName
            }
          />

          <InfoLine
            className={'ContestedResourcesTotalCard__InfoLine'}
            title={'Document Type'}
            loading={false}
            error={false}
            value={
            <Badge
              size={'sm'}
            >
              {data?.documentTypeName}
            </Badge>
            }
          />
        </div>


        <div className={'ContestedResourcesTotalCard__Avatar'}>
          <SignatureIcon/>
        </div>
      </div>

      <HorisontalSeparator className={'ContestedResourcesTotalCard__Separator'}/>

      <div className={'ContestedResourcesTotalCard__CommonInfo'}>
        <InfoLine
          title={'Height'}
          value={1111111}
          loading={false}
          error={false}
        />
      </div>
    </div>
  )
}

export default ContestedResourcesTotalCard
