import './Breadcrumbs.scss'
import Link from 'next/link'
import { BlockIcon, ChevronIcon } from '../ui/icons'
import { useBreadcrumbs } from '../../contexts/BreadcrumbsContext'
import ImageGenerator from '../imageGenerator'

export const breadcrumbsActiveRoutes = [
  '/validator/',
  '/transaction/',
  '/identity/',
  '/dataContract/',
  '/document/',
  '/block/',
  '/contestedResource/'
]

export const Breadcrumbs = () => {
  const { breadcrumbs } = useBreadcrumbs()

  const icons = {
    block: <BlockIcon className={'Breadcrumbs__Icon Breadcrumbs__Icon--Block'}/>
  }

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
          ? <li className={`Breadcrumbs__Link ${link?.shrink ? 'Breadcrumbs__Link--Shrink' : ''}`} key={i}>
              <LinkContainer href={i !== breadcrumbs.length - 1 ? link?.path : null} key={i}>
                {link?.icon && <div className={'Breadcrumbs__IconContainer'}>{icons?.[link?.icon] || null}</div>}

                {(link?.avatar || link?.avatarSource) &&
                  <ImageGenerator className={'Breadcrumbs__Avatar'} username={link?.avatarSource || link.label} lightness={50} saturation={50} width={16} height={16} />}
                <div className={'Breadcrumbs__Label'}>{link.label}</div>
              </LinkContainer>

              {i !== breadcrumbs.length - 1 && <div className={'Breadcrumbs__Separator'}><ChevronIcon color={'brand.normal'}/></div>}
          </li>
          : ''
        )}
      </ul>
    </div>
  )
}
