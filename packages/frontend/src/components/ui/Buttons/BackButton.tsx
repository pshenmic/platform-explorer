'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { useRouter } from 'next/navigation'

interface BackButtonProps extends ComponentPropsWithoutRef<'button'> {
  link?: string
}

function BackButton({ link, children, ...props }: BackButtonProps) {
  const router = useRouter()

  return (
    <button type="button" aria-label="Go back" onClick={() => router.back()} {...props}>
      {children}
    </button>
  )
}

export default BackButton
