'use client'

import type { ComponentProps } from 'react'
import { useRouter } from 'next/navigation'

interface BackButtonProps extends ComponentProps<'button'> {
  link?: string
}

function BackButton ({ link, children, ...props }: BackButtonProps) {
  const router = useRouter()

  return <button onClick={() => router.back()} {...props}>{children}</button>
}

export default BackButton
