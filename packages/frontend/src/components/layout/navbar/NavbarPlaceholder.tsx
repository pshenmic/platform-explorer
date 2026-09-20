import { usePathname } from 'next/navigation'
import { breadcrumbsActiveRoutes } from '../../breadcrumbs/routes'
import '../../breadcrumbs/Breadcrumbs.css'
import './NavbarShell.css'

export default function NavbarPlaceholder() {
  const pathname = usePathname()

  return (
    <div className={'NavbarShell'} aria-hidden={'true'}>
      <div className={'NavbarStub'} />
      {breadcrumbsActiveRoutes.some(route => pathname.includes(route)) && (
        <div className={'Breadcrumbs'}>
          <div className={'Breadcrumbs__LinksContainer'} />
        </div>
      )}
    </div>
  )
}
