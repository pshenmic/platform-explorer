import { Tabs, Tab, Button, TabList, Flex } from '@chakra-ui/react'

export const TypesList = () => {
  return (
        <Flex>
            <Tabs w='100%'>
                <TabList>
                    <Tab>1. Document Type</Tab>
                    <Tab>2. Type</Tab>
                    <Flex flex={1} justify='end' align='center'>
                        <Button variant='brand' size='sm'>Add Document Type</Button>
                    </Flex>
                </TabList>
            </Tabs>

        </Flex>
  )
}
