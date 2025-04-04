import { Box, Flex } from '@chakra-ui/react'
import ImageGenerator from '../../imageGenerator'
import './TotalValidatorsCardContent.scss'

export function TotalValidatorsCardContent ({ validators }) {
  return (
    <div className={'TotalValidatorsCardContent'}>
      <div className={'TotalValidatorsCardContent__Count'}>
        {typeof validators?.data?.pagination?.total === 'number'
          ? validators.data.pagination.total
          : 'n/a'}
      </div>
      <Flex className={'TotalValidatorsCardContent__Avatars'}>
        {validators.data?.resultSet?.map((validator, i) => (
          <Box opacity={ 1 - 0.1 * i } key={i}>
            <ImageGenerator
              className={''}
              username={validator.proTxHash}
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
