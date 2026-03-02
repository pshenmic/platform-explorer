import { createContext, useContext, useEffect, useState } from 'react'

const INITIAL = `{
          "name": {
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

const SHEME_INIT = JSON.parse(INITIAL)

const SchemaContext = createContext(null)

export const useSchema = () => useContext(SchemaContext)

export const SchemaProvider = ({ children }) => {
  const [value, setValue] = useState(INITIAL)
  const [schema, setScheme] = useState(SHEME_INIT)
  const [currentType, setCurrentType] = useState('name')
  const [error, setError] = useState(null)

  const properties = schema[currentType]?.properties

  const addType = (name) => {
    const updatedScheme = { ...schema, [name]: INITIAL.name }
    const string = JSON.stringify(updatedScheme, null, 2)
    setScheme(updatedScheme)
    setValue(string)
  }

  const hangleChangePropName = (prev, next) => {
    const { [prev]: curr, ...other } = properties

    const updatedScheme = {
      ...schema,
      [currentType]: {
        ...schema[currentType],
        properties: {
          ...other,
          [next]: curr
        }
      }
    }

    const string = JSON.stringify(updatedScheme, null, 2)

    setScheme(updatedScheme)
    setValue(string)
  }

  const handleChangePropType = (name, typeValue) => {
    const updatedScheme = {
      ...schema,
      [currentType]: {
        ...schema[currentType],
        properties: {
          ...properties,
          [name]: {
            ...properties[name],
            type: typeValue
          }
        }
      }
    }

    const string = JSON.stringify(updatedScheme, null, 2)

    setScheme(updatedScheme)
    setValue(string)
  }

  const typeNames = schema ? Object.keys(schema) : []

  useEffect(() => {
    const parse = () => {
      try {
        const parsed = JSON.parse(value)
        setScheme(parsed)
        setError(null)
      } catch (e) {
        setError(e)
      }
    }

    parse()
  }, [value])

  return (
    <SchemaContext.Provider
      value={{
        value,
        schema,
        properties,
        typeNames,
        error,
        currentType,
        addType,
        handleChangeType: setCurrentType,
        handleChange: setValue,
        hangleChangePropName,
        handleChangePropType
      }}
    >
      {children}
    </SchemaContext.Provider>
  )
}
