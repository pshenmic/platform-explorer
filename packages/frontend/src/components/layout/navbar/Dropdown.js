'use client'

import NavigationButton from '../../ui/NavigationButton/NavigationButton'
import './NetworkSelect.scss'

// props.data - The data array [{ name: '', subname: '', disabled: boolean, link: '' }]
function Dropdown ({ active, data }) {
  const ButtonContainer = ({ item, children }) => item.name !== active
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
