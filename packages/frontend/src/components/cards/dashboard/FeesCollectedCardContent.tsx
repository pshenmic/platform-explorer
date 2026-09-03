import { Flex, Text } from '@chakra-ui/react'
import type { EpochData, Rate, Status } from '../../../types'
import { RateTooltip } from '../../ui/Tooltips'
import { currencyRound } from '../../../util'
import { InfoIcon } from '@chakra-ui/icons'
import './FeesCollectedCardContent.css'

interface FeesCollectedCardContentProps {
  epoch?: Pick<EpochData, 'totalCollectedFees'> | null
  status?: Pick<Status, 'totalCollectedFeesDay'> | null
  rate?: Pick<Rate, 'usd'> | null
}

export function FeesCollectedCardContent({ epoch, status, rate }: FeesCollectedCardContentProps) {
  return (
    <div className={'FeesCollectedCardContent'}>
      <div className={'FeesCollectedCardContent__TotalCollectedFees'}>
        {typeof epoch?.totalCollectedFees === 'number' ? (
          <RateTooltip credits={epoch.totalCollectedFees} rate={rate}>
            <span className={'FeesCollectedCardContent__FeesContainer'}>
              {currencyRound(epoch.totalCollectedFees)}
              <InfoIcon ml={2} color={'brand.light'} boxSize={4} />
            </span>
          </RateTooltip>
        ) : (
          'n/a'
        )}
      </div>
      {status?.totalCollectedFeesDay && (
        <Flex fontFamily={'mono'} fontSize={'0.75rem'} fontWeight={'normal'}>
          <Text color={'gray.500'} mr={'8px'}>
            Last 24h:{' '}
          </Text>
          <Text>
            {typeof status?.totalCollectedFeesDay === 'number'
              ? currencyRound(status?.totalCollectedFeesDay)
              : 'n/a'}
          </Text>
        </Flex>
      )}
    </div>
  )
}
