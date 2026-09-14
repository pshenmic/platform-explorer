import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

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

export type SchemaContextValue = {
  value: string
  error: string | null
  handleChange: (value: string) => void
  handleReset: () => void
}

const SchemaContext = createContext<SchemaContextValue | null>(null)

export const useSchema = (): SchemaContextValue => {
  const ctx = useContext(SchemaContext)
  if (!ctx) throw new Error('useSchema must be used within SchemaProvider')
  return ctx
}

const validateStructure = (schema: unknown): void => {
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    throw new Error('Schema must be an object of document types')
  }

  const typeNames = Object.keys(schema as Record<string, unknown>)
  if (typeNames.length === 0) {
    throw new Error('Schema must contain at least one document type')
  }

  for (const name of typeNames) {
    const def = (schema as Record<string, unknown>)[name]
    if (typeof def !== 'object' || def === null) {
      throw new Error(`"${name}" must be an object`)
    }
    const defObj = def as Record<string, unknown>
    if (defObj.type !== 'object') {
      throw new Error(`"${name}" must have "type": "object"`)
    }
    if (typeof defObj.properties !== 'object' || defObj.properties === null) {
      throw new Error(`"${name}" must have "properties" object`)
    }
    if (defObj.additionalProperties !== false) {
      throw new Error(`"${name}" must have "additionalProperties": false`)
    }
    for (const propName of Object.keys(defObj.properties as Record<string, unknown>)) {
      const prop = (defObj.properties as Record<string, unknown>)[propName]
      if (typeof prop !== 'object' || prop === null) {
        throw new Error(`"${name}.${propName}" must be an object`)
      }
      const propObj = prop as Record<string, unknown>
      if (typeof propObj.type !== 'string') {
        throw new Error(`"${name}.${propName}" is missing "type"`)
      }
      if (typeof propObj.position !== 'number') {
        throw new Error(`"${name}.${propName}" must have numeric "position"`)
      }
    }
  }
}

export const SchemaProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState(INITIAL_SCHEMA)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(value)
      validateStructure(parsed)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
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
