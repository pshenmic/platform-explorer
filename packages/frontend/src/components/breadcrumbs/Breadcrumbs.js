import './Breadcrumbs.scss'
import Link from 'next/link'
import { ChevronIcon } from '../ui/icons'
import { useBreadcrumbs } from '../../contexts/BreadcrumbsContext'
import ImageGenerator from '../imageGenerator'

const Breadcrumbs = () => {
  const { breadcrumbs } = useBreadcrumbs()

  if (!breadcrumbs || breadcrumbs?.length === 0) return

  const LinkContainer = ({ children, href, ...props }) => {
    if (href) {
      return <Link href={href} {...props}>{children}</Link>
    }

    return <span {...props}>{children}</span>
  }

  return (
    <div className={'Breadcrumbs'}>
      <ul className={'Breadcrumbs__LinksContainer'}>
        {breadcrumbs.map((link, i) => link?.label
          ? <li className={'Breadcrumbs__Link'} key={i}>
              <LinkContainer href={i !== breadcrumbs.length - 1 ? link?.path : null} key={i}>
                {(link?.avatar || link?.avatarSource) &&
                  <ImageGenerator className={'Breadcrumbs__Avatar'} username={link?.avatarSource || link.label} lightness={50} saturation={50} width={16} height={16} />}
                {link.label}
              </LinkContainer>

              {i !== breadcrumbs.length - 1 && <div className={'Breadcrumbs__Separator'}><ChevronIcon color={'brand.normal'}/></div>}
            </li>
          : ''
        )}
      </ul>
    </div>
  )
}

export default Breadcrumbs
