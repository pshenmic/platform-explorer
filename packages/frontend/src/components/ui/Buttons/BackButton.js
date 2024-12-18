'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

function BackButton ({ link, children, ...props }) {
  const router = useRouter()

  return link
    ? <Link href={link} {...props}>{children}</Link>
    : <button onClick={() => router.back()} {...props}>{children}</button>
}

export default BackButton
