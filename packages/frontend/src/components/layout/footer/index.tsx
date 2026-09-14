'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import version from './version'
import { BigClockIcon, PlatformExplorerLogoStroke, PshenmicLogoIcon } from '../../ui/icons'
import LocalTime from './LocalTime'
import Link from 'next/link'
import './Footer.css'

interface SocialNetworkItem {
  img: string
  href: string
  alt: string
  ariaLabel: string
}

const socialNetwork: SocialNetworkItem[] = [
  {
    img: '/images/icons/github.svg',
    href: 'https://github.com/pshenmic/platform-explorer/',
    alt: 'github',
    ariaLabel: 'Go to GitHub'
  },
  {
    img: '/images/icons/twitter.svg',
    href: 'https://x.com/Dashpay',
    alt: 'twitter',
    ariaLabel: 'Go to X(twitter)'
  },
  {
    img: '/images/icons/discord.svg',
    href: 'https://discord.gg/KrPbKUN8Ug',
    alt: 'discord',
    ariaLabel: 'Go to Discord'
  }
]

function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  useEffect(() => setCurrentYear(new Date().getFullYear()), [])

  return (
    <div className={'FooterShell'}>
      <div className={'FooterStub'}></div>

      <footer className={'Footer'}>
        <div className={'Footer__TimezoneContainer'}>
          <BigClockIcon className={'Footer__ClockIcon'} w={'35px'} h={'34px'} />

          <div className={'Footer__TimezoneMeta'}>
            <a
              className={'Footer__PshenmicLogo'}
              href={'https://pshenmic.dev/'}
              target={'_blank'}
              rel={'noopener noreferrer'}
              aria-label={'Go to Pschenmic Dev'}
            >
              <PshenmicLogoIcon w={'95px'} h={'8px'} />
            </a>
            <LocalTime className={'Footer__LocalTime'} />
          </div>
        </div>

        {socialNetwork.length ? (
          <div className={'Footer__WrapperNetwork'}>
            {socialNetwork.map((item, i) => (
              <a
                key={i}
                className={'Footer__Network'}
                href={item.href ? item.href : '#'}
                target={'_blank'}
                rel={'noopener noreferrer'}
                aria-label={item.ariaLabel}
              >
                <Image src={item.img} width={20} height={20} alt={item.alt || ''} />
              </a>
            ))}
          </div>
        ) : null}

        <div className={'Footer__CopyrightBlock'}>
          <p className={'Footer__Copyright'}>
            {currentYear} © Dash Platform Explorer
            <br />v{version} MIT LICENCE
          </p>
          <Link className={'Footer__Logo'} href={'/'}>
            <PlatformExplorerLogoStroke w={'2rem'} h={'2rem'} color={'gray.250'} />
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default Footer
