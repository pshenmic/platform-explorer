import { Box, Flex } from '@chakra-ui/react'
import Image from 'next/image'
import './footer.scss'
import version from './version'

const socialNetwork = [
  { img: '/images/icons/github.svg', href: 'https://github.com/pshenmic/platform-explorer/', alt: 'github', ariaLabel: 'Go to GitHub' },
  { img: '/images/icons/twitter.svg', href: 'https://x.com/Dashpay', alt: 'twitter', ariaLabel: 'Go to X(twitter)' },
  { img: '/images/icons/discord.svg', href: 'https://discord.gg/KrPbKUN8Ug', alt: 'discord', ariaLabel: 'Go to Discord' }
]

function Footer () {
  return (
        <Box
            px={3}
            marginTop={'auto'}
        >
            <Flex
                className={'Footer'}
                maxW={'1980px'}
                ml={'auto'}
                mr={'auto'}
                h={'auto'}
                alignItems={'center'}
                justifyContent={'space-between'}
            >
                <a
                    href={'https://pshenmic.dev/'}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                    aria-label={'Go to Pschenmic Dev'}
                >
                    pshenmic.dev
                </a>
                {socialNetwork.length
                  ? (<div className={'Footer__WrapperNetwork'}>
                        {socialNetwork.map((item, i) => (
                            <a
                                key={i}
                                className={'Footer__Network'}
                                href={item.href ? item.href : '#'}
                                target={'_blank'}
                                rel={'noopener noreferrer'}
                                aria-label={item.ariaLabel}
                            >
                                <Image src={item.img} width={20} height={20} alt={item.alt} />
                            </a>
                        ))}
                    </div>)
                  : null}
                <p className={'Footer__Copyright'}>2024 © Dash Platform Explorer v{version} MIT LICENCE</p>
            </Flex>
        </Box>
  )
}

export default Footer
