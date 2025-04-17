import { Alias, CreditsBlock, DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { SignatureIcon } from '../ui/icons'
import contestedResources from '../../util/contestedResources'
import { ValueCard } from '../cards'
import { Badge } from '@chakra-ui/react'
import ContestedResourcesDigestCard from './ContestedResourceDigestCard'
import { ContendersList } from './contenders'
import { InfoBlock } from '../ui/containers'
import { colors } from '../../styles/colors'
import './ContestedResourceTotalCard.scss'

function ContestedResourceTotalCard ({ contestedResource, rate, className }) {
  const { data, loading } = contestedResource

  const colorScheme = data?.status === 'finished' && data?.totalCountLock !== data?.totalCountTowardsIdentity
    ? data?.totalCountLock > data?.totalCountTowardsIdentity
      ? 'red'
      : 'green'
    : 'blue'

  const signIconColor = {
    blue: colors.brand.normal,
    red: colors.red.default,
    green: colors.green.default
  }

  return (
    <InfoBlock
      gradient={true}
      colorScheme={colorScheme}
      className={`ContestedResourcesTotalCard ${loading ? 'ContestedResourceTotalCard--Loading' : ''} ${className || ''}`}
    >
      <div className={'ContestedResourcesTotalCard__Title'}>
        <Alias>{contestedResources.getResourceValue(data?.resourceValue)}</Alias>
      </div>

      <div className={'ContestedResourcesTotalCard__ContentContainer'}>
        <div className={'ContestedResourcesTotalCard__Column'}>
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
                  <Badge size={'sm'}>
                    {data?.documentTypeName}
                  </Badge>
                }
              />
            </div>

            <div className={'ContestedResourcesTotalCard__Avatar'}>
              <SignatureIcon color={signIconColor[colorScheme]}/>
            </div>
          </div>

          <HorisontalSeparator className={'ContestedResourcesTotalCard__Separator'}/>

          <div className={'ContestedResourcesTotalCard__CommonInfo'}>
            <InfoLine
              title={'Creation Date'}
              value={<DateBlock showTime={true} timestamp={data?.timestamp}/>}
              loading={false}
              error={false}
            />

            <InfoLine
              title={'Prefunding Voting Balance'}
              value={(
                <CreditsBlock
                  credits={data?.prefundedVotingBalance?.[data?.indexName]}
                  rate={rate}
                />
              )}
              loading={false}
              error={false}
            />

            <InfoLine
              title={'Gas Fees'}
              value={<CreditsBlock credits={data?.totalGasUsed} rate={rate}/>}
              loading={false}
              error={false}
            />
          </div>
        </div>

        <div className={'ContestedResourcesTotalCard__Column'}>
          <ContestedResourcesDigestCard contestedResource={contestedResource}/>
        </div>
      </div>

      <ContendersList
        className={'ContestedResourcesTotalCard__ContendersList'}
        contenders={contestedResource?.data?.contenders}
      />
    </InfoBlock>
  )
}

export default ContestedResourceTotalCard
