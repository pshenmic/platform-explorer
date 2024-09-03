'use client'

import { usePathname } from 'next/navigation'
import './Background.scss'

function Background () {
  const pathname = usePathname()
  const showOnRoutes = [
    '/',
    '/blocks',
    '/transactions',
    '/dataContracts',
    '/identities',
    '/validators',
    '/transactions'
  ]
  const showDecoration = showOnRoutes.includes(pathname)

  return (
    <div className={`Background ${showDecoration ? 'Background--Light' : ''}`}></div>
  )
}

export default Background
