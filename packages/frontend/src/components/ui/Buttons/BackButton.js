'use client'

import { useRouter } from 'next/navigation'

function BackButton ({ link, children, ...props }) {
  const router = useRouter()

  return <button onClick={() => router.back()} {...props}>{children}</button>
}

export default BackButton
