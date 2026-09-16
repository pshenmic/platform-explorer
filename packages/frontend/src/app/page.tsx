import type { Metadata } from 'next'
import Home from './home/Home'
import HomeHeroBrand from './home/HomeHeroBrand'
import { HOME_HERO_LCP_CSS } from './home/homeHeroLcpCss'

export const metadata: Metadata = {
  title: 'Dashboard — Dash Platform Explorer',
  description:
    'Dashboard of Dash Platform. The Last Transactions, Blocks, Data contracts, Documents, Transfers, Average block time.',
  keywords: [
    'Dash',
    'platform',
    'explorer',
    'blockchain',
    'Transactions',
    'Blocks',
    ' Data contracts',
    'Documents',
    'Transfers',
    'platform dash money'
  ],
  applicationName: 'Dash Platform Explorer'
}

async function HomeRoute() {
  return (
    <>
      <style
        href={'home-hero-lcp'}
        precedence={'high'}
        dangerouslySetInnerHTML={{ __html: HOME_HERO_LCP_CSS }}
      />
      <Home brand={<HomeHeroBrand />} />
    </>
  )
}

export default HomeRoute
