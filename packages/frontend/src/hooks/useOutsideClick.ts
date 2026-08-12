'use client'

import { useOutsideClick as useChakraOutsideClick } from '@chakra-ui/react'
import type { RefObject } from 'react'

/**
 * React 19: useRef() is RefObject<T | null>; Chakra 2 types expect RefObject<HTMLElement>.
 * Thin wrapper so call sites stay typed without casts.
 */
export function useOutsideClick(props: {
  ref: RefObject<HTMLElement | null>
  handler: (event: Event) => void
  enabled?: boolean
}): void {
  useChakraOutsideClick({
    ...props,
    ref: props.ref as RefObject<HTMLElement>
  })
}
