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

const validateStructure = (schema) => {
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    throw new Error('Schema must be an object of document types')
  }

  const typeNames = Object.keys(schema)
  if (typeNames.length === 0) {
    throw new Error('Schema must contain at least one document type')
  }

  for (const name of typeNames) {
    const def = schema[name]
    if (typeof def !== 'object' || def === null) {
      throw new Error(`"${name}" must be an object`)
    }
    if (def.type !== 'object') {
      throw new Error(`"${name}" must have "type": "object"`)
    }
    if (typeof def.properties !== 'object' || def.properties === null) {
      throw new Error(`"${name}" must have "properties" object`)
    }
    if (def.additionalProperties !== false) {
      throw new Error(`"${name}" must have "additionalProperties": false`)
    }
    for (const propName of Object.keys(def.properties)) {
      const prop = def.properties[propName]
      if (typeof prop !== 'object' || prop === null) {
        throw new Error(`"${name}.${propName}" must be an object`)
      }
      if (typeof prop.type !== 'string') {
        throw new Error(`"${name}.${propName}" is missing "type"`)
      }
      if (typeof prop.position !== 'number') {
        throw new Error(`"${name}.${propName}" must have numeric "position"`)
      }
    }
  }
}

export const SchemaProvider = ({ children }) => {
  const [value, setValue] = useState(INITIAL_SCHEMA)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const parsed = JSON.parse(value)
      validateStructure(parsed)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [value])

  const handleReset = () => setValue(INITIAL_SCHEMA)

  return (
    <SchemaContext.Provider
      value={{
        value,
        error,
        handleChange: setValue,
        handleReset
      }}
    >
      {children}
    </SchemaContext.Provider>
  )
}
