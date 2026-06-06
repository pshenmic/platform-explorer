// Mirrors packages/api/src/models/Localization.js
// Used by Token.localizations as Record<localeKey, Localization>.

export interface Localization {
  pluralForm: string
  singularForm: string
  shouldCapitalize: boolean
}
