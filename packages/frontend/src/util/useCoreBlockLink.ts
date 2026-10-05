'use client'

import { useQuery } from '@tanstack/react-query'
import { useActiveNetwork } from '../contexts'
import { getCoreBlockHash } from './Api'
import { getL1ExplorerLink } from './l1Explorer'

export function useCoreBlockLink(height: number | null | undefined, baseUrl?: string | null) {
  const network = useActiveNetwork()
  const validHeight =
    typeof height === 'number' && Number.isInteger(height) && height >= 0 && height <= 2147483647
  const { data, isError } = useQuery({
    queryKey: ['coreBlockHash', network.name, height],
    queryFn: () => getCoreBlockHash(height as number),
    enabled: validHeight && Boolean(baseUrl),
    staleTime: 0,
    refetchInterval: 60_000,
    retry: false
  })

  return validHeight && !isError && data?.network === network.name && data.height === height
    ? getL1ExplorerLink(baseUrl, 'block', data.hash)
    : undefined
}
