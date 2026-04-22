import { Flex, Grid } from '@chakra-ui/react'
import { CardWrapper } from './CardWrapper'
import {
  KeywordsField,
  DescriptionField,
  CommentField,
  AdditionalFields,
  PropertiesCard
} from './Fields'

export const CardsGrid = () => {
  return (
    <Grid w="100%" templateColumns="1fr 1fr" gap={5}>
      <Flex direction="column" gap={5}>
        <CardWrapper title="Data Contract Properties">
          <PropertiesCard />
        </CardWrapper>
        <CardWrapper title="Description">
          <DescriptionField />
        </CardWrapper>

        <CardWrapper title="Additional Fields">
          <AdditionalFields />
        </CardWrapper>
      </Flex>

      <Flex direction="column" gap={5}>
        <CardWrapper title="Keywords">
          <KeywordsField />
        </CardWrapper>
        <CardWrapper title="Comment">
          <CommentField />
        </CardWrapper>
      </Flex>
    </Grid>
  )
}
