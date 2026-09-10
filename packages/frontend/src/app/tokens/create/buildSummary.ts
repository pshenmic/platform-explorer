import type { TokenForm } from './TokenWizardContext'

const formatNumber = (n: string | number | null | undefined): string | null => {
  if (n === '' || n == null) return null
  const value = String(n).replace(/\D/g, '')
  if (!value) return null
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const buildSummary = (form: TokenForm): string[] => {
  const bullets: string[] = []

  const name = form.name?.trim() || 'Unnamed token'
  const supply = formatNumber(form.baseSupply)

  bullets.push(supply ? `${supply} ${name}` : `${name} — supply not set`)

  if (form.hasMaxSupply) {
    const max = formatNumber(form.maxSupply)
    bullets.push(max ? `Max supply: ${max}` : 'Max supply set but value missing')
  } else {
    bullets.push('No max supply (uncapped)')
  }

  if (form.allowMint) bullets.push('Mintable by contract owner')
  else bullets.push('Mint disabled — supply is permanent')

  if (form.allowBurn) bullets.push('Holders can burn their tokens')
  if (form.allowTransfer) bullets.push('Holders can transfer tokens')
  if (form.allowDirectPurchase)
    bullets.push('Direct purchase from issuer enabled (set price later)')

  if (form.startAsPaused) bullets.push('Starts paused — owner must unpause before transfers')
  if (form.allowFreeze) bullets.push('Owner can freeze and unfreeze holder balances')
  if (form.allowDestroyFrozen) bullets.push('Owner can burn frozen funds')
  if (form.allowEmergency) bullets.push('Emergency pause available to owner')

  const description = form.description?.trim()
  if (description) bullets.push(`Description: ${description}`)

  return bullets
}
