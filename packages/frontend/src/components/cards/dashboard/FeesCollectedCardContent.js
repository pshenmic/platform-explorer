import { Flex, Text } from '@chakra-ui/react'
import { RateTooltip } from '../../ui/Tooltips'
import { currencyRound } from '../../../util'
import { InfoIcon } from '@chakra-ui/icons'
import './FeesCollectedCardContent.scss'

export function FeesCollectedCardContent ({ epoch, status, rate }) {
  return (
    <div className={'FeesCollectedCardContent'}>
      <div className={'FeesCollectedCardContent__TotalCollectedFees'}>
        {typeof epoch?.totalCollectedFees === 'number'
          ? <RateTooltip
            credits={epoch.totalCollectedFees}
            rate={rate}
          >
            <span className={'FeesCollectedCardContent__FeesContainer'}>
              {currencyRound(epoch.totalCollectedFees)}
              <InfoIcon ml={2} color={'brand.light'} boxSize={4}/>
            </span>
          </RateTooltip>
          : 'n/a'}
      </div>
      {status?.totalCollectedFeesDay &&
        <Flex fontFamily={'mono'} fontSize={'0.75rem'} fontWeight={'normal'}>
          <Text color={'gray.500'} mr={'8px'}>Last 24h: </Text>
          <Text>
            {typeof status?.totalCollectedFeesDay === 'number'
              ? currencyRound(status?.totalCollectedFeesDay)
              : 'n/a'}
          </Text>
        </Flex>
      }
    </div>
  )
}
