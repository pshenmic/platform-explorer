import { useState, useCallback } from 'react'

const useFilters = (defaultFilters = {}) => {
  const [filters, setFilters] = useState(defaultFilters)

  /** Delete empty fields */
  const prepareFilters = useCallback((filters) => {
    const preparedFilters = { ...filters }

    Object.keys(preparedFilters).forEach(key => {
      if (preparedFilters[key] === '' || preparedFilters[key] === undefined) {
        delete preparedFilters[key]
      }
    })

    return preparedFilters
  }, [])

  /** Edit single fields */
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [filterName]: value ?? ''
      }
      return prepareFilters(newFilters)
    })
  }, [prepareFilters])

  /** Edit array type filters */
  const handleMultipleValuesChange = useCallback((fieldName, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[fieldName] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]

      return prepareFilters({
        ...prevFilters,
        [fieldName]: newValues
      })
    })
  }, [prepareFilters])

  return {
    filters,
    setFilters,
    handleFilterChange,
    handleMultipleValuesChange,
    prepareFilters
  }
}

export default useFilters
