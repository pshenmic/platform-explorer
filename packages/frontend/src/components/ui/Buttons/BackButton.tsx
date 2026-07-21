'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { useRouter } from 'next/navigation'

interface BackButtonProps extends ComponentPropsWithoutRef<'button'> {
  link?: string
}

function BackButton ({ link, children, ...props }: BackButtonProps) {
  const router = useRouter()

  return <button onClick={() => router.back()} {...props}>{children}</button>
}

export default BackButton
