import { Box, Flex } from '@chakra-ui/react'
import type { Validator } from '../../../types'
import type { LoadableState } from '../../../types/common'
import ImageGenerator from '../../imageGenerator'
import './TotalValidatorsCardContent.css'

interface ValidatorsListData {
  pagination?: {
    total?: number
  }
  resultSet?: Array<Pick<Validator, 'proTxHash'>>
}

interface TotalValidatorsCardContentProps {
  validators?: LoadableState<ValidatorsListData> | {
    data?: ValidatorsListData | null
  }
}

export function TotalValidatorsCardContent ({ validators }: TotalValidatorsCardContentProps) {
  return (
    <div className={'TotalValidatorsCardContent'}>
      <div className={'TotalValidatorsCardContent__Count'}>
        {typeof validators?.data?.pagination?.total === 'number'
          ? validators.data.pagination.total
          : 'n/a'}
      </div>
      <Flex className={'TotalValidatorsCardContent__Avatars'}>
        {validators?.data?.resultSet?.map((validator, i) => (
          <Box opacity={ 1 - 0.1 * i } key={i}>
            <ImageGenerator
              className={''}
              username={validator.proTxHash ?? ''}
              lightness={50}
              saturation={50}
              width={32}
              height={32}
            />
          </Box>
        ))}
      </Flex>
    </div>
  )
}
