import { Flex, Grid } from '@chakra-ui/react'
import { CardWrapper } from './CardWrapper'
import { KeywordsField, DescriptionField, CommentField, AdditionalFields } from './Fields'

export const DocumentFields = () => {
  return (
    <Grid w='100%' templateColumns='1fr 1fr' gap={5}>
      <Flex direction='column' gap={5}>
        <CardWrapper title='Description'>
          <DescriptionField />
        </CardWrapper>

        <CardWrapper title='Additional Fields'>
          <AdditionalFields />
        </CardWrapper>
      </Flex>

      <Flex direction='column' gap={5}>
        <CardWrapper title='Keywords'>
          <KeywordsField />
        </CardWrapper>
        <CardWrapper title='Comment'>
          <CommentField />
        </CardWrapper>
      </Flex>
    </Grid>
  )
}
