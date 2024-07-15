'use client'
import { memo } from 'react'
import NavigationButton from '../ui/NavigationButton/NavigationButton'
import './Navbar.scss'

// props.data - The data array [{name: '', subname: '', activeButton: boolean}]

function InternalNavigation({ active, setActive, data }) {

    return (
        <div className='InternalNavigation' >
            {data?.length ?
                data?.map((_, i) => (
                    <NavigationButton key={i} active={active}  name={_.name} subName={_.subname} activeButton={_.activeButton} onClick={() => setActive(_.name)}/>
                ))
                : null}
        </div>
    )
}

export default memo(InternalNavigation)