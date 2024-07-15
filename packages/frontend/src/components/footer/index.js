import { Box, Flex } from '@chakra-ui/react'
import Image from 'next/image'
import './footer.scss'

const socialNetwork = [
  { img: '/images/icons/github.svg', href: 'https://github.com/pshenmic/platform-explorer/', alt: 'github' },
  { img: '/images/icons/twitter.svg', href: 'https://x.com/Dashpay', alt: 'twitter' },
  { img: '/images/icons/discord.svg', href: 'https://discord.gg/GeH3ug5G', alt: 'discord' }
]

function Footer () {
  return (
        <Box px={3}>
            <Flex
                className='Footer'
                maxW='1980px'
                ml='auto'
                mr='auto'
                h='auto'
                alignItems='center'
                justifyContent='space-between'
            >
                <p>pshenmic.dev</p>
                {socialNetwork.length
                  ? (<div className='Footer__WrapperNetwork'>
                        {socialNetwork.map((item, i) => (
                            <a
                                key={i}
                                className='Footer__Network'
                                href={item.href ? item.href : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image src={item.img} width={20} height={20} alt={item.alt} />
                            </a>
                        ))}
                    </div>)
                  : null}
                <p className='Footer__Copyright'>2024 © Dash Platform Explorer v0.2 MIT LICENCE</p>
            </Flex>
        </Box>
  )
}

export default Footer
