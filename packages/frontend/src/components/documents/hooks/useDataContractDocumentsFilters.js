import { decodeDateFromURL, encodeDateToURL } from '@utils/url'
import { useQueryState } from 'nuqs'

export const useDataContractDocumentsFilters = () => {
  const [documentTypeName, setDocumentTypeName] = useQueryState('document_type_name', {
    scroll: false,
    shallow: true
  })
  const [owner, setOwner] = useQueryState('owner', {
    scroll: false,
    shallow: true
  })
  const [revisionMin, setRevisionMin] = useQueryState('revision_min', {
    scroll: false,
    shallow: true
  })
  const [revisionMax, setRevisionMax] = useQueryState('revision_max', {
    scroll: false,
    shallow: true
  })
  const [tsStart, setTsStart] = useQueryState('timestamp_start', {
    scroll: false,
    shallow: true
  })
  const [tsEnd, setTsEnd] = useQueryState('timestamp_end', {
    scroll: false,
    shallow: true
  })

  const tsStartISO = (() => {
    const d = decodeDateFromURL(tsStart)
    return d ? d.toISOString() : tsStart || undefined
  })()
  const tsEndISO = (() => {
    const d = decodeDateFromURL(tsEnd)
    return d ? d.toISOString() : tsEnd || undefined
  })()

  const filters = {
    document_type_name: documentTypeName || undefined,
    owner: owner || undefined,
    revision_min:
      revisionMin != null && revisionMin !== '' ? Number(revisionMin) : undefined,
    revision_max:
      revisionMax != null && revisionMax !== '' ? Number(revisionMax) : undefined,
    timestamp_start: tsStartISO,
    timestamp_end: tsEndISO
  }

  const setFilters = (next) => {
    if (!next) return

    if ('document_type_name' in next) {
      setDocumentTypeName(next.document_type_name || null)
    }

    if ('owner' in next) {
      setOwner(next.owner || null)
    }

    if ('revision_min' in next) {
      setRevisionMin(
        next.revision_min !== '' && next.revision_min != null
          ? String(next.revision_min)
          : null
      )
    }

    if ('revision_max' in next) {
      setRevisionMax(
        next.revision_max !== '' && next.revision_max != null
          ? String(next.revision_max)
          : null
      )
    }

    if ('timestamp_start' in next) {
      const encoded = encodeDateToURL(next.timestamp_start)
      setTsStart(encoded ?? null)
    }
    if ('timestamp_end' in next) {
      const encoded = encodeDateToURL(next.timestamp_end)
      setTsEnd(encoded ?? null)
    }
  }

  return { filters, setFilters }
}
