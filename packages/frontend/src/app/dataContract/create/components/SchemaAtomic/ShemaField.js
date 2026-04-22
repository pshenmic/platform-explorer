import { Textarea } from '@chakra-ui/react'
import { useSchema } from '../../SchemaProvider'

const PLACEHOLDER = `{
  "myType": {
    "type": "object",
    "properties": {
      "myField": {
        "type": "string",
        "position": 0
      }
    },
    "required": ["myField"],
    "additionalProperties": false
  }
}`

export const SchemaField = (props) => {
  const { value, handleChange } = useSchema()

  return (
    <Textarea
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={PLACEHOLDER}
      resize='vertical'
      fontFamily='monospace'
      {...props}
    />
  )
}
