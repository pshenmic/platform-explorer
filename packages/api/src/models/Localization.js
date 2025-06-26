module.exports = class Localization {
  pluralForm
  singularForm
  shouldCapitalize

  constructor (pluralForm, singularForm, shouldCapitalize) {
    this.pluralForm = pluralForm ?? null
    this.singularForm = singularForm ?? null
    this.shouldCapitalize = shouldCapitalize ?? null
  }

  static fromObject ({ pluralForm, singularForm, shouldCapitalize }) {
    return new Localization(pluralForm, singularForm, shouldCapitalize)
  }
}
