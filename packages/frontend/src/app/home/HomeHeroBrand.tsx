import './HomeHero.css'

export default function HomeHeroBrand() {
  return (
    <div className={'HomeHero__Brand'}>
      <div className={'HomeHero__BrandCopy'}>
        <p className={'HomeHero__Welcome'}>Welcome to</p>
        <h1 className={'HomeHero__Title'}>
          <span className={'HomeHero__TitleShine'}>Platform Explorer</span>
        </h1>
        <p className={'HomeHero__Tagline'}>The information resource about Dash Platform</p>
        <p className={'HomeHero__Description'}>
          Your portal for real-time and historical data across the Dash blockchain — track and
          verify transactions, identities, contracts and documents with confidence.
        </p>
      </div>
    </div>
  )
}
