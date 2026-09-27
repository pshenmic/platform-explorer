import type { ReactNode } from 'react'
import type { WithChildren, WithClassName } from '../../../types/common'
import { Breadcrumbs } from '../../breadcrumbs/Breadcrumbs'
import './PageDataContainer.css'

interface PageDataContainerProps extends WithChildren, WithClassName {
  title?: ReactNode
}

function PageDataContainer({ className, title, children }: PageDataContainerProps) {
  return (
    <div className={`PageDataContainer ${className || ''}`}>
      <div className={'PageDataContainer__Inner'}>
        <div className={'PageDataContainer__Header'}>{title && <Breadcrumbs title={title} />}</div>

        <div className={'PageDataContainer__ContentContainer'}>
          <div className={'PageDataContainer__Content'}>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default PageDataContainer
