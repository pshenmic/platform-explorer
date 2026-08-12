'use client'

import './Snow.scss'

function Snow () {
  return (
    <div className={'Snow'}>
      <div className={'Snow__TopContainer'}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className={'Snow__Snowflake'}>&#10052;</div>
        ))}
      </div>
      <div className={'Snow__BottomContainer'}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className={'Snow__Snowflake'}>&#10052;</div>
        ))}
      </div>
    </div>
  )
}

export default Snow
