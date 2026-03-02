import { Tabs, Tab, Button, TabList, Flex, Text } from '@chakra-ui/react'
import { useSchema } from '../SchemaProvider'

export const TypesList = () => {
  const { typeNames } = useSchema()

  return (
    <Flex>
      <Tabs w="100%">
        <TabList>
          {typeNames.map((title, idx) => (
            <Tab key={`${title}-${idx}`}>
              <Text textTransform="capitalize">
                {idx + 1}. {title}
              </Text>
            </Tab>
          ))}
          <Flex flex={1} justify="end" align="center">
            <Button variant="brand" size="sm">
              Add Document Type
            </Button>
          </Flex>
        </TabList>
      </Tabs>
    </Flex>
  )
}
