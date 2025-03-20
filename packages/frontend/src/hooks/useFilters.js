import { useState } from 'react'

export const useFilters = (defaultFilters = {}) => {
  const [filters, setFilters] = useState(defaultFilters)

  /** Delete single fields */
  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value
    }
    return prepareFilters(newFilters)
  }

  /** Edit array type filters */
  const handleMultipleValuesChange = (fieldName, value) => {
    const currentValues = filters[fieldName]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]

    return prepareFilters({
      ...filters,
      [fieldName]: newValues
    })
  }

  /** Delete empty fields */
  const prepareFilters = (filters) => {
    const preparedFilters = { ...filters }

    Object.keys(preparedFilters).forEach(key => {
      if (preparedFilters[key] === '' || preparedFilters[key] === undefined) {
        delete preparedFilters[key]
      }
    })

    return preparedFilters
  }

  return {
    filters,
    setFilters,
    handleFilterChange,
    handleMultipleValuesChange,
    prepareFilters
  }
}
