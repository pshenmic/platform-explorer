import { Textarea } from '@chakra-ui/react'
import { useSchema } from '../../SchemaProvider'

const PALCEHOLDER = `{
          "Pshenmic.dev": {
            "type": "object",
            "properties": {
              "Value": {
                "position": 0,
                "type": "string"
              }
            },
            "indices": [],
            "additionalProperties": false
          }
        }`

export const SchemaField = (props) => {
  const { value, handleChange } = useSchema()

  return (
    <Textarea
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={PALCEHOLDER}
      resize="none"
      {...props}
    />
  )
}
