import { useState, useCallback } from 'react'

export type FilterValue = string | string[] | number | boolean | null | undefined
export type Filters = Record<string, FilterValue>

const useFilters = (defaultFilters: Filters = {}) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters)

  /** Delete empty fields */
  const prepareFilters = useCallback((filters: Filters): Filters => {
    const preparedFilters: Filters = { ...filters }

    Object.keys(preparedFilters).forEach(key => {
      if (preparedFilters[key] === '' || preparedFilters[key] === undefined) {
        delete preparedFilters[key]
      }
    })

    return preparedFilters
  }, [])

  /** Edit single fields */
  const handleFilterChange = useCallback((filterName: string, value: FilterValue) => {
    setFilters(prevFilters => {
      const newFilters: Filters = {
        ...prevFilters,
        [filterName]: value ?? ''
      }
      return prepareFilters(newFilters)
    })
  }, [prepareFilters])

  /** Edit array type filters */
  const handleMultipleValuesChange = useCallback((fieldName: string, value: string) => {
    setFilters(prevFilters => {
      const currentValues = (prevFilters[fieldName] as string[] | undefined) ?? []
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
