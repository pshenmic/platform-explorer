'use client'

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode
} from 'react'
import './Tabs.css'

interface TabsContextValue {
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  isLazy: boolean
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within Tabs')
  return ctx
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  index?: number
  defaultIndex?: number
  onChange?: (index: number) => void
  isLazy?: boolean
  preserveScroll?: boolean
  variant?: string
  children?: ReactNode
}

export function Tabs({
  index,
  defaultIndex = 0,
  onChange,
  isLazy = false,
  preserveScroll = false,
  variant,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultIndex)
  const selectedIndex = index ?? uncontrolled
  const baseId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollReserve = useRef<{ panel: HTMLElement; height: number; scrollY: number } | null>(null)
  const pendingReserve = useRef(false)

  useLayoutEffect(() => {
    const reserve = scrollReserve.current
    const root = rootRef.current
    if (!pendingReserve.current || !reserve || !root) return
    pendingReserve.current = false
    const toolbarHeight =
      root.getBoundingClientRect().height - reserve.panel.getBoundingClientRect().height
    const height = Math.max(0, reserve.height - toolbarHeight)
    reserve.panel.style.minHeight = height ? `${height}px` : ''
    scrollReserve.current = height ? { ...reserve, height } : null
  }, [selectedIndex])

  useEffect(() => {
    const releaseReserve = () => {
      const reserve = scrollReserve.current
      if (!reserve || window.scrollY >= reserve.scrollY) return
      const height =
        window.scrollY === 0 ? 0 : Math.max(0, reserve.height - (reserve.scrollY - window.scrollY))
      reserve.panel.style.minHeight = height ? `${height}px` : ''
      scrollReserve.current = height ? { ...reserve, height, scrollY: window.scrollY } : null
    }
    window.addEventListener('scroll', releaseReserve, { passive: true })
    return () => window.removeEventListener('scroll', releaseReserve)
  }, [])

  const setSelectedIndex = useCallback(
    (next: number) => {
      // Keep enough panel height that a shorter tab does not pull the page up.
      const root = rootRef.current
      const panel = root?.querySelector<HTMLElement>(':scope > .Tabs__TabPanels')
      if (
        preserveScroll &&
        next !== selectedIndex &&
        panel &&
        root?.closest('.InfoContainer--Tabs')
      ) {
        const scrollY = window.scrollY
        const spareHeight = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight - scrollY
        )
        const height =
          scrollY > 0 ? Math.max(0, root.getBoundingClientRect().height - spareHeight) : 0
        pendingReserve.current = height > 0
        panel.style.minHeight = height ? `${height}px` : ''
        scrollReserve.current = height ? { panel, height, scrollY } : null
      }
      if (index === undefined) setUncontrolled(next)
      onChange?.(next)
    },
    [index, onChange, selectedIndex, preserveScroll]
  )

  const value = useMemo(
    () => ({ selectedIndex, setSelectedIndex, isLazy, baseId }),
    [selectedIndex, setSelectedIndex, isLazy, baseId]
  )

  return (
    <TabsContext.Provider value={value}>
      <div
        ref={rootRef}
        className={['Tabs', variant ? `Tabs--${variant}` : '', className || '']
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function TabList({ className, children, ...props }: TabListProps) {
  const { selectedIndex, setSelectedIndex, baseId } = useTabsContext()
  let tabIndex = 0

  return (
    <div
      role={'tablist'}
      className={['Tabs__TabList', className || ''].filter(Boolean).join(' ')}
      {...props}
    >
      {Children.map(children, child => {
        if (!isValidElement(child) || child.type !== Tab) return child
        const i = tabIndex++
        return cloneElement(child as ReactElement<TabProps>, {
          index: i,
          isSelected: selectedIndex === i,
          onSelect: () => setSelectedIndex(i),
          id: `${baseId}-tab-${i}`,
          panelId: `${baseId}-panel-${i}`
        })
      })}
    </div>
  )
}

export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  index?: number
  isSelected?: boolean
  onSelect?: () => void
  panelId?: string
  isDisabled?: boolean
}

export function Tab({
  className,
  children,
  index: _index,
  isSelected,
  onSelect,
  panelId,
  id,
  isDisabled,
  ...props
}: TabProps) {
  return (
    <button
      type={'button'}
      role={'tab'}
      id={id}
      aria-selected={isSelected}
      aria-controls={panelId}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      tabIndex={isSelected ? 0 : -1}
      className={['Tabs__Tab', isSelected ? 'Tabs__Tab--Selected' : '', className || '']
        .filter(Boolean)
        .join(' ')}
      onClick={isDisabled ? undefined : onSelect}
      {...props}
    >
      {children}
    </button>
  )
}

export interface TabPanelsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function TabPanels({ className, children, ...props }: TabPanelsProps) {
  const { selectedIndex, isLazy, baseId } = useTabsContext()
  let panelIndex = 0

  return (
    <div className={['Tabs__TabPanels', className || ''].filter(Boolean).join(' ')} {...props}>
      {Children.map(children, child => {
        if (!isValidElement(child) || child.type !== TabPanel) return child
        const i = panelIndex++
        return cloneElement(child as ReactElement<TabPanelProps>, {
          index: i,
          isSelected: selectedIndex === i,
          isLazy,
          id: `${baseId}-panel-${i}`,
          tabId: `${baseId}-tab-${i}`
        })
      })}
    </div>
  )
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  position?: CSSProperties['position']
  index?: number
  isSelected?: boolean
  isLazy?: boolean
  tabId?: string
}

export function TabPanel({
  className,
  children,
  position,
  style,
  isSelected,
  isLazy,
  id,
  tabId,
  index: _index,
  ...props
}: TabPanelProps) {
  const hidden = !isSelected
  const content = isLazy && hidden ? null : children

  return (
    <div
      role={'tabpanel'}
      id={id}
      aria-labelledby={tabId}
      hidden={hidden}
      className={['Tabs__TabPanel', className || ''].filter(Boolean).join(' ')}
      style={{ position, ...style }}
      {...props}
    >
      {content}
    </div>
  )
}

export default Tabs
