import type { Dispatch, ReactNode, SetStateAction } from 'react'

/**
 * Generic async-data container used across data-fetching components.
 * `data` holds the loaded payload (or `null` on error / before first load),
 * `props` carries view-local state (pagination, print counts, …).
 */
export interface LoadableState<T = unknown> {
  data: T | null
  loading: boolean
  error: boolean
  props?: Record<string, unknown>
}

/** React state setter for a {@link LoadableState} slice. */
export type LoadableSetter<T = unknown> = Dispatch<SetStateAction<LoadableState<T>>>

/** Mixin for components accepting an optional `className`. */
export interface WithClassName {
  className?: string
}

/** Mixin for components rendering `children`. */
export interface WithChildren {
  children?: ReactNode
}
