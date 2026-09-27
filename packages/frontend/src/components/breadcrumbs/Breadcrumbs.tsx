'use client'

import './Breadcrumbs.css'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useBreadcrumbs } from '../../contexts/BreadcrumbsContext'

export const Breadcrumbs = ({ title }: { title: ReactNode }) => {
  const { breadcrumbs } = useBreadcrumbs()
  const parents = breadcrumbs
    .slice(0, -1)
    .filter(link => link.path && link.path !== '/' && link.label)

  return (
    <nav className="Breadcrumbs" aria-label="Breadcrumb">
      <ol className="Breadcrumbs__LinksContainer">
        {parents.map(link => (
          <li className="Breadcrumbs__Link" key={link.path}>
            <Link href={link.path!} title={link.label}>
              {link.label}
            </Link>
            <span className="Breadcrumbs__Separator" aria-hidden="true">
              /
            </span>
          </li>
        ))}
        <li className="Breadcrumbs__Current" aria-current="page">
          {title}
        </li>
      </ol>
    </nav>
  )
}
