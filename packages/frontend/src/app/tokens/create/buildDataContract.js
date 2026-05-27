// Pure helper: form state → the full Data Contract body that gets broadcast,
// with the token configuration nested inside. Mirrors what useCreateToken.js
// assembles at deploy time. Read-only preview — id / ownerId / version are
// filled by the SDK / chain, shown here as placeholders so the user sees the
// real shape (a token is a part of a data contract, not a standalone entity).

import { buildTokenConfiguration } from './buildTokenConfiguration'

export const buildDataContract = (form) => ({
  id: '(generated on deploy)',
  ownerId: '(your identity)',
  version: 1,
  // Placeholder document type required until pshenmic-dpp attaches tokens
  // before DPP structural validation (see useCreateToken.js).
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
