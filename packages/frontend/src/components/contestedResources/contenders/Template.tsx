import type { ReactNode } from 'react'
import type { WithChildren, WithClassName } from '../../../types'

import './Template.css'

interface ContendersTemplateProps extends WithChildren, WithClassName {
  isVoteVisible?: boolean
}

export const ContendersTemplate = ({
  children,
  isVoteVisible,
  className = ''
}: ContendersTemplateProps) => (
  <div className={`ContendersList ${className}`}>
    <div className={'ContendersList__ScrollZone'}>
      <div
        className={`ContendersList__ColumnTitles ${isVoteVisible ? '' : 'ContendersList__ColumnTitles--Hidden'}`}
      >
        <div className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Timestamp'}>
          Date
        </div>
        <div className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Hash'}>
          Tx Hash
        </div>
        <div className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Identity'}>
          Identity
        </div>
        <div className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Document'}>
          Document
        </div>
        <div className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Votes'}>
          Votes
        </div>
        {isVoteVisible && (
          <div className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Actions'}>
            Actions
          </div>
        )}
      </div>
      <div className={'VotesList__Items'}>{children as ReactNode}</div>
    </div>
  </div>
)
