import { createContext, useContext, useEffect, useState } from 'react'

const INITIAL_SCHEMA = `{
  "note": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "position": 0
      }
    },
    "required": ["message"],
    "additionalProperties": false
  }
}`

const SchemaContext = createContext(null)

export const useSchema = () => useContext(SchemaContext)

export const SchemaProvider = ({ children }) => {
  const [value, setValue] = useState(INITIAL_SCHEMA)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      JSON.parse(value)
      setError(null)
    } catch (e) {
      setError(e)
    }
  }, [value])

  return (
    <SchemaContext.Provider
      value={{
        value,
        error,
        handleChange: setValue
      }}
    >
      {children}
    </SchemaContext.Provider>
  )
}
