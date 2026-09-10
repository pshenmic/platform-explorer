'use client'

import { useLinkStatus } from 'next/link'
import './NavLinkStatus.css'

export default function NavLinkStatus() {
  const { pending } = useLinkStatus()

  return pending ? (
    <span className={'NavLinkStatus'} role={'status'} aria-label={'Opening page'} />
  ) : null
}
