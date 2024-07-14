
import {
    Box,
    Flex,
} from '@chakra-ui/react'

import './footer.scss'
import Image from 'next/image'

const socialNetwork = [
    { img: '/images/icons/github.svg', href: '', alt: 'github' },
    { img: '/images/icons/twitter.svg', href: '', alt: 'twitter' },
    { img: '/images/icons/discord.svg', href: '', alt: 'discord' },
]

function Footer() {

    return (
        <Box px={3}>
            <Flex
                className={'footer'}
                maxW='1980px'
                ml='auto'
                mr='auto'
                h='auto'
                alignItems={'center'}
                justifyContent={'space-between'}
            >
                <p>pshenmic.dev</p>
                {socialNetwork?.length ?
                    <div className='wrapperNetwork'>
                        {
                            socialNetwork.map((_, i) => (
                                <a className='network' href={_?.href ? _.href : '#'}>
                                    <Image src={_.img} width={20} height={20} alt={_.alt} />
                                </a>
                            ))
                        }
                    </div>
                    : null}
                <p className='copyright'>2024 © Dash Platform Explorer v0.2 MIT LICENCE</p>
            </Flex>
        </Box>
    )
}

export default Footer
