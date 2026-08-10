export type BreakpointKey = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

export type BreakpointVisibility = Record<BreakpointKey, boolean>

export interface NavMenuItem {
  title: string
  href?: string
  disabled?: boolean
  breakpoints?: Partial<BreakpointVisibility>
  submenuItems?: NavMenuItem[]
}
