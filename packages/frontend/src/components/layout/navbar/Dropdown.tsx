'use client'

import type { ReactNode } from 'react'
import type { NetworkOption } from '../../../constants/networks'
import NavigationButton from '../../ui/NavigationButton/NavigationButton'
import './NetworkSelect.scss'

interface DropdownProps {
  active?: string
  data?: NetworkOption[]
}

interface ButtonContainerProps {
  item: NetworkOption
  children: ReactNode
}

// props.data - The data array [{ name: '', subname: '', disabled: boolean, link: '' }]
function Dropdown ({ active, data }: DropdownProps) {
  const ButtonContainer = ({ item, children }: ButtonContainerProps) => item.name !== active
    ? <a href={item.explorerBaseUrl} rel={'noopener noreferrer'}>{children}</a>
    : children

  return (
    <div className={'InternalNavigation'}>
      {data?.length
        ? data.map((item, i) => (
          <ButtonContainer item={item} key={i}>
            <NavigationButton
              key={i}
              active={active === item.name}
              name={item.name}
              subName={item.subname}
              disabled={item.disabled}
            />
          </ButtonContainer>
        ))
        : null}
    </div>
  )
}

export default Dropdown
