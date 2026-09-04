'use client'

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
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
  variant?: string
  children?: ReactNode
}

export function Tabs({
  index,
  defaultIndex = 0,
  onChange,
  isLazy = false,
  variant,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultIndex)
  const selectedIndex = index ?? uncontrolled
  const baseId = useId()

  const setSelectedIndex = useCallback(
    (next: number) => {
      if (index === undefined) setUncontrolled(next)
      onChange?.(next)
    },
    [index, onChange]
  )

  const value = useMemo(
    () => ({ selectedIndex, setSelectedIndex, isLazy, baseId }),
    [selectedIndex, setSelectedIndex, isLazy, baseId]
  )

  return (
    <TabsContext.Provider value={value}>
      <div
        className={['Tabs', variant ? `Tabs--${variant}` : '', className || ''].filter(Boolean).join(' ')}
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
