import { Textarea } from '@chakra-ui/react'

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

export const SchemaField = (props) => (
  <Textarea
    resize='none'
    placeholder={PALCEHOLDER}
    {...props}
  />
)
