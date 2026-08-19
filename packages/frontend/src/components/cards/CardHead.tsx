import { Heading } from '@chakra-ui/react'

<<<<<<< HEAD
// corner title badge; omit title to keep only the right slot (e.g. presets)
export default function CardHead ({ title, extra, children, className = '' }) {
  const heading = title
    ? <Heading className={'InfoBlock__Title'} as={'h2'}>{title}</Heading>
    : null
||||||| c35d400e
interface CardHeadProps extends WithChildren, WithClassName {
  title?: ReactNode
  extra?: ReactNode
}

// title flag docked to the corner, `extra` beside it, `children` in the right slot (.InfoBlock__Head)
export default function CardHead ({ title, extra, children, className = '' }: CardHeadProps) {
  const heading = <Heading className={'InfoBlock__Title'} as={'h2'}>{title}</Heading>
=======
interface CardHeadProps extends WithChildren, WithClassName {
  title?: ReactNode
  extra?: ReactNode
}

// title flag docked to the corner, `extra` beside it, `children` in the right slot (.InfoBlock__Head)
export default function CardHead({ title, extra, children, className = '' }: CardHeadProps) {
  const heading = (
    <Heading className={'InfoBlock__Title'} as={'h2'}>
      {title}
    </Heading>
  )
>>>>>>> origin/style/frontend-biome-format-js

  return (
    <div className={`InfoBlock__Head ${className}`.trim()}>
<<<<<<< HEAD
      {extra
        ? <div className={'InfoBlock__HeadLeft'}>{heading}{extra}</div>
        : heading}
||||||| c35d400e
      {extra
        ? <div className={'InfoBlock__HeadLeft'}>{heading}{extra}</div>
        : heading}
      {/* right-side slot: positioning lives here (see .InfoBlock__HeadSlot), not on the child */}
=======
      {extra ? (
        <div className={'InfoBlock__HeadLeft'}>
          {heading}
          {extra}
        </div>
      ) : (
        heading
      )}
      {/* right-side slot: positioning lives here (see .InfoBlock__HeadSlot), not on the child */}
>>>>>>> origin/style/frontend-biome-format-js
      {children && <div className={'InfoBlock__HeadSlot'}>{children}</div>}
    </div>
  )
}
