// Mirrors useCreateToken at deploy. id/ownerId/version are placeholders — the SDK / chain fills them.

import { buildTokenConfiguration } from './buildTokenConfiguration'

export const buildDataContract = (form) => ({
  id: '(generated on deploy)',
  ownerId: '(your identity)',
  version: 1,
  // Placeholder document type — workaround for pshenmic-dpp NAPI (see useCreateToken.js).
  documentSchemas: {
    note: {
      type: 'object',
      properties: {
        message: { type: 'string', maxLength: 256, position: 0 }
      },
      additionalProperties: false
    }
  },
  tokens: {
    0: buildTokenConfiguration(form)
  }
})
