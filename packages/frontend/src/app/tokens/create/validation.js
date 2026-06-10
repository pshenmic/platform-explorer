// Pre-flight form checks + a mapper for raw WASM/SDK errors. Returns messages; empty = valid.

// Loose base58 length check — catches obviously-wrong ids, not strict parsing.
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{40,46}$/
const isIdentityId = (s) => BASE58.test((s || '').trim())
const isWholeNumber = (s) => /^\d+$/.test((s || '').trim())
const isPositive = (s) => isWholeNumber(s) && BigInt(s.trim()) > 0n

export const validateForm = (form) => {
  const errors = []

  const name = (form.name || '').trim()
  if (name.length < 3 || name.length > 25) {
    errors.push('Token name must be 3–25 characters.')
  }

  if (!isWholeNumber(form.baseSupply)) {
    errors.push('Base supply must be a whole number.')
  }

  if (form.hasMaxSupply) {
    if (!isPositive(form.maxSupply)) {
      errors.push('Max supply must be a whole number greater than 0.')
    } else if (isWholeNumber(form.baseSupply) && BigInt(form.maxSupply.trim()) < BigInt(form.baseSupply.trim())) {
      errors.push('Max supply must be at least the base supply.')
    }
  }

  if ((form.destinationIdentity || '').trim() && !isIdentityId(form.destinationIdentity)) {
    errors.push('New tokens destination identity is not a valid Identity ID.')
  }

  ;(form.preProgrammedRows || []).forEach((row, i) => {
    if (!row.time && !row.identity && !row.amount) return // untouched seed row
    const n = i + 1
    if (!row.time) errors.push(`Pre-programmed row ${n}: pick a date and time.`)
    if (!isIdentityId(row.identity)) errors.push(`Pre-programmed row ${n}: recipient is not a valid Identity ID.`)
    if (!isPositive(row.amount)) errors.push(`Pre-programmed row ${n}: amount must be greater than 0.`)
  })

  if (form.perpetualEnabled) {
    if (!isPositive(form.perpetualIntervalValue)) errors.push('Perpetual distribution: interval must be greater than 0.')
    if (!isPositive(form.perpetualAmount)) errors.push('Perpetual distribution: amount must be greater than 0.')
    if (form.perpetualRecipient === 'identity' && !isIdentityId(form.perpetualRecipientIdentity)) {
      errors.push('Perpetual distribution: recipient is not a valid Identity ID.')
    }
  }

  return errors
}

// Map common cryptic errors; keep the original as fallback.
export const humanizeDeployError = (e) => {
  const raw = (e?.message ?? String(e ?? '')).trim()
  const low = raw.toLowerCase()
  if (low.includes('no signer')) return 'Connect a wallet or enter a private key first.'
  if (low.includes('insufficient') || low.includes('not enough') || low.includes('credit') || low.includes('balance')) {
    return 'Not enough credits on this identity to pay for the deploy.'
  }
  if (low.includes('nonce')) return 'Identity nonce is out of sync — reload the page and try again.'
  if (low.includes('timeout') || low.includes('timed out') || low.includes('network') || low.includes('fetch') || low.includes('connect')) {
    return 'Network error reaching the platform. Check your connection and retry.'
  }
  if (low.includes('signature') || low.includes('signing') || low.includes('invalid key') || low.includes('wif')) {
    return 'Signing failed — check your private key and try again.'
  }
  if (low.includes('identit') && low.includes('not found')) return 'Identity not found on this network.'
  return raw || 'Failed to deploy token.'
}
