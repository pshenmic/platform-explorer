import { Heading } from '@chakra-ui/react'

// corner title badge; omit title to keep only the right slot (e.g. presets)
export default function CardHead ({ title, extra, children, className = '' }) {
  const heading = title
    ? <Heading className={'InfoBlock__Title'} as={'h2'}>{title}</Heading>
    : null

  return (
    <div className={`InfoBlock__Head ${className}`.trim()}>
      {extra
        ? <div className={'InfoBlock__HeadLeft'}>{heading}{extra}</div>
        : heading}
      {children && <div className={'InfoBlock__HeadSlot'}>{children}</div>}
    </div>
  )
}
