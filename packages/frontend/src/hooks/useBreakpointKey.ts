import { useEffect, useState } from 'react'
import type { BreakpointKey } from '../components/layout/navbar/types'

const QUERIES: [BreakpointKey, string][] = [
  ['3xl', '(min-width: 120em)'],
  ['2xl', '(min-width: 96em)'],
  ['xl', '(min-width: 80em)'],
  ['lg', '(min-width: 62em)'],
  ['md', '(min-width: 48em)'],
  ['sm', '(min-width: 30em)']
]

export function useIsMobile(): boolean {
  const key = useBreakpointKey()
  return key === 'base' || key === 'sm'
}

export function useBreakpointKey(): BreakpointKey {
  const [key, setKey] = useState<BreakpointKey>('base')

  useEffect(() => {
    const mqs = QUERIES.map(([name, query]) => [name, window.matchMedia(query)] as const)

    const update = () => {
      for (const [name, mq] of mqs) {
        if (mq.matches) {
          setKey(name)
          return
        }
      }
      setKey('base')
    }

    update()
    mqs.forEach(([, mq]) => mq.addEventListener('change', update))
    return () => mqs.forEach(([, mq]) => mq.removeEventListener('change', update))
  }, [])

  return key
}
