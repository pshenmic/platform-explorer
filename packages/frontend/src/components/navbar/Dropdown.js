'use client'

import NavigationButton from '../ui/NavigationButton/NavigationButton'
import './NetworkSelect.scss'

// props.data - The data array [{name: '', subname: '', activeButton: boolean}]
function Dropdown ({ active, setActive, data }) {
  return (
    <div className={'InternalNavigation'}>
      {data?.length
        ? data.map((item, i) => (
          <NavigationButton
            key={i}
            active={active}
            name={item.name}
            subName={item.subname}
            activeButton={item.activeButton}
            onClick={() => setActive(item.name)}
          />
        ))
        : null}
    </div>
  )
}

export default Dropdown
