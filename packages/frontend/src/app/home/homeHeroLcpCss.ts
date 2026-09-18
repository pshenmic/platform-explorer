/** Inline LCP CSS for the home hero brand — keep under ~3 KB. */
export const HOME_HERO_LCP_CSS = `
.HomePage{width:100%;max-width:1920px;margin:12px auto;padding:0 8px;color:#fff;display:flex;flex-direction:column;gap:12px;box-sizing:border-box}
.HomeHero{position:relative;width:100%;padding:0;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:rgba(24,31,34,.88);overflow:visible}
.HomeHero__Inner{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2rem 3rem;padding:20px 32px}
.HomeHero__Brand,.HomeHero__BrandCopy{min-width:0;width:100%}
.HomeHero__Welcome{margin:0 0 10px;font-size:.8125rem;font-weight:700;font-style:italic;text-transform:uppercase;letter-spacing:.04em;color:#008de4}
.HomeHero__Title{margin:0 0 12px;font-size:2.5rem;font-weight:700;font-style:italic;line-height:1.22;color:#fff}
.HomeHero__TitleShine{color:#fff}
.HomeHero__Tagline{margin:0 0 12px;font-size:1.125rem;font-weight:700;font-style:italic;line-height:1.3;color:#fff}
.HomeHero__Description{margin:0;max-width:28rem;font-size:.8125rem;line-height:1.55;color:#9aa5ad}
@media(max-width:62em){.HomeHero__Inner{grid-template-columns:1fr;padding:20px 24px}}
@media(max-width:48em){.HomeHero__Inner{padding:16px}.HomeHero__Title{font-size:1.75rem}.HomeHero__Tagline{font-size:1rem}.HomeHero__Description{font-size:.75rem}}
`
  .replace(/\s+/g, ' ')
  .trim()
