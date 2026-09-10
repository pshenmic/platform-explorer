import type { ReactNode } from 'react'
import type { WithClassName } from '../../types/common'
import './Intro.css'

interface IntroProps extends WithClassName {
  title?: ReactNode
  description?: ReactNode
  block?: ReactNode
}

function Intro({ title, description, block, className }: IntroProps) {
  return (
    <div className={`Intro ${className || ''}`}>
      <div className={'Intro__Info'}>
        <h1 className={'Intro__Title'}>{title}</h1>

        <div className={'Intro__Accent'} />

        {description}
      </div>
      {block && <div className={'Intro__Block'}>{block}</div>}
    </div>
  )
}

export default Intro
