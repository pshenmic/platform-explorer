'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Api from '../../util/Api'
import { ResponseErrorNotFound } from '../../util/Errors'
import { ErrorMessageBlock } from '../../components/Errors'
import SearchResultsList, {
  type SearchResultsData
} from '../../components/search/SearchResultsList'
import { getOnlyResultUrl } from '../../components/search/getFirstResultUrl'
import type { LoadableState } from '../../types'

export default function Search({ query }: { query: string }) {
  const router = useRouter()
  const [results, setResults] = useState<LoadableState<SearchResultsData>>({
    data: {},
    loading: Boolean(query),
    error: false
  })

  useEffect(() => {
    let cancelled = false
    if (!query) {
      setResults({ data: {}, loading: false, error: false })
      return
    }
    setResults({ data: {}, loading: true, error: false })
    Api.search(query)
      .then(res => {
        const data = res as SearchResultsData
        if (cancelled) return
        const url = getOnlyResultUrl(data)
        if (url) router.replace(url)
        setResults({ data, loading: false, error: false })
      })
      .catch(error => {
        if (cancelled) return
        setResults({ data: {}, loading: false, error: !(error instanceof ResponseErrorNotFound) })
      })
    return () => {
      cancelled = true
    }
  }, [query, router])

  const hasResults = Object.values(results.data || {}).some(items => items?.length)
  return (
    <div className={'ListPage'}>
      <div className={'InfoBlock'}>
        <h1>Search</h1>
        {!query ? (
          <p>Enter a query in the search field above.</p>
        ) : results.error ? (
          <ErrorMessageBlock />
        ) : !results.loading && !hasResults ? (
          <p>No results for “{query}”</p>
        ) : (
          <SearchResultsList results={results} />
        )}
      </div>
    </div>
  )
}
