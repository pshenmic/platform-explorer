import { useState } from 'react'

export const useFilters = (defaultFilters = {}) => {
  const [filters, setFilters] = useState(defaultFilters)

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value
    }
    return prepareFilters(newFilters)
  }

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

  const handleSelectAll = (fieldName, allValues) => {
    return prepareFilters({
      ...filters,
      [fieldName]: allValues
    })
  }

  const prepareFilters = (filters) => {
    const filterParams = { ...filters }

    // Удаляем пустые значения
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] === '') {
        delete filterParams[key]
      }
    })

    return filterParams
  }

  return {
    filters,
    setFilters,
    handleFilterChange,
    handleMultipleValuesChange,
    handleSelectAll,
    prepareFilters
  }
}
