'use client'

import { usePathname } from 'next/navigation'
import Snow from './Snow'
import './Background.scss'

function Background ({ snow }) {
  const pathname = usePathname()
  const showOnRoutes = [
    '/',
    '/blocks',
    '/transactions',
    '/dataContracts',
    '/identities',
    '/validators',
    '/transactions',
    '/contestedResources',
    '/masternodeVotes'
  ]
  const showDecoration = showOnRoutes.includes(pathname) || true

  return (
    <>
      <div className={`Background ${showDecoration ? 'Background--Light' : ''}`}></div>
      {snow && <Snow/>}
    </>
  )
}

export default Background
