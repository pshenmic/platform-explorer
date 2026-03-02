import { Button, Flex, Heading } from '@chakra-ui/react'
import { TrashButton } from '@components/ui/Buttons'
import { PropertieItem } from './PropertieItem'
import { useSchema } from '../../../../SchemaProvider'

export const PropertiesCard = () => {
  const { properties, hangleChangePropName, handleChangePropType } = useSchema()

  const keys = Object.keys(properties)

  return (
    <>
      <Flex width="100%" justify="space-between">
        <Heading
          as="h2"
          textTransform="uppercase"
          size={'xs'}
          fontWeight={'bold'}
          my={3}
          mx={0}
        >
          Properties
        </Heading>
        <TrashButton size="md" />
      </Flex>

      {keys.map((name, idx) => (
        <PropertieItem
          name={name}
          onChange={(next) => hangleChangePropName(name, next)}
          onTypeChange={(typeValue) => handleChangePropType(name, typeValue)}
          fieldType={properties[name]?.type}
          key={idx}
        />
      ))}
      <Button mt={2} variant="blue" width="100%">
        Add Propertie
      </Button>
    </>
  )
}
