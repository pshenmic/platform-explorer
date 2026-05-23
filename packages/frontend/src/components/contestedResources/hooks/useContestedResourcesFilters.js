import { useQueryState } from 'nuqs'

export const useContestedResourcesFilters = () => {
  const [timestampStart, setTimestampStart] = useQueryState('timestamp_start', { scroll: false, shallow: true })
  const [timestampEnd, setTimestampEnd] = useQueryState('timestamp_end', { scroll: false, shallow: true })
  const [documentTypeName, setDocumentTypeName] = useQueryState('document_type_name', { scroll: false, shallow: true })
  const [contractId, setContractId] = useQueryState('contract_id', { scroll: false, shallow: true })
  const [isVotingFinished, setIsVotingFinished] = useQueryState('is_voting_finished', { scroll: false, shallow: true })

  const filters = {
    timestamp_start: timestampStart || undefined,
    timestamp_end: timestampEnd || undefined,
    document_type_name: documentTypeName || undefined,
    contract_id: contractId || undefined,
    is_voting_finished: isVotingFinished === 'true' ? true : isVotingFinished === 'false' ? false : undefined
  }

  const setFilters = (next) => {
    if (!next) return

    if ('timestamp_start' in next) setTimestampStart(next.timestamp_start || null)
    if ('timestamp_end' in next) setTimestampEnd(next.timestamp_end || null)
    if ('document_type_name' in next) setDocumentTypeName(next.document_type_name || null)
    if ('contract_id' in next) setContractId(next.contract_id || null)
    if ('is_voting_finished' in next) {
      setIsVotingFinished(
        next.is_voting_finished === true || next.is_voting_finished === 'true'
          ? 'true'
          : next.is_voting_finished === false || next.is_voting_finished === 'false'
            ? 'false'
            : null
      )
    }
  }

  return { filters, setFilters }
}
