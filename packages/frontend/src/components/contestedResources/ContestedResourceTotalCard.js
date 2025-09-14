import { memo, useMemo } from 'react'
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
  const { data, loading, error } = contestedResource

  const isEnded = data?.status === 'finished' || data?.finished === true

  const winner = useMemo(() => {
    return data?.towardsIdentity
      ? data?.towardsIdentity
      : data?.contenders?.length === 1 && data?.totalCountVotes === 0
        ? data?.contenders[0]?.identifier
        : null
  }, [data?.towardsIdentity, data?.contenders, data?.totalCountVotes])

  const colorScheme = useMemo(() => {
    return isEnded
      ? winner
        ? 'green'
        : 'red'
      : 'blue'
  }, [data?.status, winner])

  const signIconColor = useMemo(() => ({
    blue: colors.brand.normal,
    red: colors.red.default,
    green: colors.green.default
  }), [])

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
                loading={loading}
                error={error}
                value={
                  <Alias>{contestedResources.getResourceValue(contestedResource?.data?.resourceValue)}</Alias>
                }
              />

              <InfoLine
                className={'ContestedResourcesTotalCard__InfoLine ContestedResourcesTotalCard__InfoLine--DataContract'}
                title={'Data Contract'}
                loading={loading}
                error={error || !data?.dataContractIdentifier}
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
                className={'ContestedResourcesTotalCard__InfoLine ContestedResourcesTotalCard__InfoLine--IndexName'}
                title={'Index Name'}
                loading={loading}
                error={error || !data?.indexName}
                value={data?.indexName}
              />

              <InfoLine
                className={'ContestedResourcesTotalCard__InfoLine ContestedResourcesTotalCard__InfoLine--DocumentType'}
                title={'Document Type'}
                loading={loading}
                error={error || !data?.documentTypeName}
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
              loading={loading}
              error={error || !data?.timestamp}
            />

            <InfoLine
              title={'Prefunding Voting Balance'}
              value={(
                <CreditsBlock
                  credits={data?.prefundedVotingBalance?.[data?.indexName]}
                  rate={rate}
                />
              )}
              loading={loading}
              error={error ||
                data?.prefundedVotingBalance?.[data?.indexName] === null ||
                data?.prefundedVotingBalance?.[data?.indexName] === undefined
              }
            />

            <InfoLine
              title={'Gas Fees'}
              value={<CreditsBlock credits={data?.totalGasUsed} rate={rate}/>}
              loading={loading}
              error={error || data?.totalGasUsed === null || data?.totalGasUsed === undefined}
            />
          </div>
        </div>

        <div className={'ContestedResourcesTotalCard__Column'}>
          <ContestedResourcesDigestCard
            contestedResource={contestedResource}
            winner={winner}
            isEnded={isEnded}
          />
        </div>
      </div>

      <div className={'ContestedResourcesTotalCard__ContendersListContainer'}>
        <div className={'ContestedResourcesTotalCard__ContendersListTitle'}>
          Contenders {typeof contestedResource?.data?.contenders?.length === 'number' &&
            <>({contestedResource?.data?.contenders?.length})</>
          }
        </div>
        <ContendersList
          contenders={contestedResource?.data?.contenders}
          isFinished={isEnded}
          loading={loading}
          itemsCount={2}
        />
      </div>
    </InfoBlock>
  )
}

export default memo(ContestedResourceTotalCard)
