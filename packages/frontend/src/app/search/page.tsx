import type { Metadata } from 'next'
import Search from './Search'

export const metadata: Metadata = { title: 'Search — Dash Platform Explorer' }

export default async function SearchRoute({
  searchParams
}: {
  searchParams: Promise<{ query?: string | string[] }>
}) {
  const { query = '' } = await searchParams
  return <Search query={(Array.isArray(query) ? query[0] : query).trim()} />
}
