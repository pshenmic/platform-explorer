// Pure helper: form state → array of plain-English bullets describing what the
// token will do. Drives the right-pane summary so users see the effect of their
// inputs in human terms, not just JSON.

const formatNumber = (n) => {
  if (n === '' || n == null) return null
  const value = String(n).replace(/\D/g, '')
  if (!value) return null
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const buildSummary = (form) => {
  const bullets = []

  const name = form.name?.trim() || 'Unnamed token'
  const supply = formatNumber(form.baseSupply)
  const decimals = Number(form.decimals) || 0

  bullets.push(
    supply
      ? `${supply} ${name} (${decimals} decimals)`
      : `${name} — supply not set (${decimals} decimals)`
  )

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
  if (form.allowDirectPurchase) bullets.push('Direct purchase from issuer enabled (set price later)')

  return bullets
}
