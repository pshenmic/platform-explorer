import { Box, Flex } from '@chakra-ui/react'
import ImageGenerator from '../../imageGenerator'

export function TotalValidatorsCard ({ validators }) {
  return (
    <div className={'TotalValidatorsCard'}>
      <div>
        {typeof validators?.data?.pagination?.total === 'number'
          ? validators.data.pagination.total
          : 'n/a'}
      </div>
      <Flex>
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
