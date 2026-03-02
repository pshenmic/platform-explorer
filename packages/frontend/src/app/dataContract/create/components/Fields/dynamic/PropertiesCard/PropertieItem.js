import {
  Flex,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react'
import { Label } from '@components/ui/forms'
import { OptionalFieldsGrid } from './OptionalFieldsGrid'

import { DATA_CONTRACT_FIELDS_ENUM as TYPE } from './constants'

import styles from './PropertieItem.module.scss'

export const PropertieItem = ({
  name,
  onChange,
  onTypeChange,
  fieldType = TYPE.STRING
}) => {
  return (
    <Flex className={styles.container}>
      <Tabs w="100%">
        <TabList>
          <Tab>Required Fields</Tab>
          <Tab>Optional Fields</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Label className={styles.label} label="Enter Property Name">
              <Input
                value={name}
                placeholder="Document Type Name..."
                onChange={(e) => onChange(e.target.value)}
              />
            </Label>
            <Flex mt={6}>
              <Label label="Type">
                <Select
                  variant="filled"
                  onChange={(e) => onTypeChange(e.target.value)}
                >
                  <option value={TYPE.STRING}>String</option>
                  <option value={TYPE.INTEGER}>Integer</option>
                  <option value={TYPE.ARRAY}>Array</option>
                  <option value={TYPE.OBJECT}>Object</option>
                  <option value={TYPE.NUMBER}>Number</option>
                  <option value={TYPE.BOOLEAN}>Boolean</option>
                </Select>
              </Label>
            </Flex>
          </TabPanel>
          <TabPanel className={styles.optional}>
            <OptionalFieldsGrid fieldType={fieldType} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  )
}
