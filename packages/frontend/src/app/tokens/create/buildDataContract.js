// Mirrors useCreateToken at deploy. id/ownerId/version are placeholders — the SDK / chain fills them.

import { buildTokenConfiguration } from './buildTokenConfiguration'

export const buildDataContract = (form) => ({
  id: '(generated on deploy)',
  ownerId: '(your identity)',
  version: 1,
  documentSchemas: {},
  tokens: {
    0: buildTokenConfiguration(form)
  }
})
