import {
  Flex,
  Grid,
  Heading,
  Input,
  Select,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react'
import { TrashButton } from '@components/ui/Buttons'
import { Label } from '@components/ui/forms'

import styles from './PropertiesCard.module.scss'

export const PropertiesCard = () => (
  <Flex width="100%" direction="column">
    <Flex width="100%" justify="space-between">
      <Heading as={'h2'} size={'xs'} fontWeight={'bold'} my={3} mx={0}>
        1. Property
      </Heading>
      <TrashButton size="md" />
    </Flex>

    <Flex>
      <Tabs w="100%">
        <TabList>
          <Tab>Required Fields</Tab>
          <Tab>Optional Fields</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Label className={styles.label} label="Enter Property Name">
              <Input placeholder="Document Type Name..." />
            </Label>
            <Flex mt={6}>
              <Label label="Type">
                <Select variant="filled">
                  <option value="string">String</option>
                  <option value="integer">Integer</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </Select>
              </Label>
            </Flex>
          </TabPanel>
          <TabPanel className={styles.optional}>
            <Grid templateColumns="1fr 1fr" gap={6}>
              <Label className={styles.label} label="Min Length">
                <Input placeholder="Minimal..." />
              </Label>
              <Label className={styles.label} label="Max Length">
                <Input placeholder="Maximum..." />
              </Label>
            </Grid>
            <Stack mt={6} gap={6}>
              <Label className={styles.label} label="RE2 Pattern">
                <Input placeholder="Pattern RE2 (Regular expression syntax)..." />
              </Label>
              <Label className={styles.label} label="Format">
                <Input placeholder="Format Specifications (email, uri etc.)..." />
              </Label>
              <Label className={styles.label} label="Description ">
                <Input placeholder="Description Text ..." />
              </Label>
              <Label className={styles.label} label="Comment">
                <Input
                  className={styles.label}
                  placeholder="Comment Text ..."
                />
              </Label>
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  </Flex>
)
