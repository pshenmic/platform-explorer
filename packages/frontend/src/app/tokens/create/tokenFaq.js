// docs.dash.org covers token operations but not configuration fields —
// the source of truth is rs-dpp `TokenConfigurationV0` doc comments.

// docs.dash.org token reference — only its "Constants and Limits" section is
// relevant to configuration (value limits); the rest is about operations.
export const TOKEN_LIMITS_DOC_URL =
  'https://docs.dash.org/projects/platform/en/stable/docs/protocol-ref/token.html#token-constants-and-limits'

// rs-dpp config lives across three structs. Line numbers verified; if they
// drift the link still lands in the right file.
const BASE =
  'https://github.com/dashpay/platform/blob/master/packages/rs-dpp/src/data_contract/associated_token'
const STRUCT = `${BASE}/token_configuration/v0/mod.rs`
const CONVENTION = `${BASE}/token_configuration_convention/v0/mod.rs`
const LOCALIZATION = `${BASE}/token_configuration_localization/v0/mod.rs`

export const STRUCT_URL = STRUCT

export const FIELD_SOURCE = {
  conventions: `${STRUCT}#L37`,
  // decimals & names live in their own structs, not in TokenConfigurationV0.
  decimals: `${CONVENTION}#L39`,
  'conventions.decimals': `${CONVENTION}#L39`,
  'conventions.localizations.en': `${LOCALIZATION}#L24`,
  shouldCapitalize: `${LOCALIZATION}#L19`,
  baseSupply: `${STRUCT}#L45`,
  maxSupply: `${STRUCT}#L51`,
  keepsHistory: `${STRUCT}#L55`,
  startAsPaused: `${STRUCT}#L61`,
  allowTransferToFrozenBalance: `${STRUCT}#L65`,
  newTokensDestinationIdentity: `${BASE}/token_distribution_rules/v0/mod.rs#L24`,
  perpetualDistribution: `${BASE}/token_distribution_rules/v0/mod.rs#L18`,
  preProgrammedDistribution: `${BASE}/token_distribution_rules/v0/mod.rs#L22`,
  distributionRules: `${STRUCT}#L75`,
  marketplaceRules: `${STRUCT}#L79`,
  manualMintingRules: `${STRUCT}#L83`,
  manualBurningRules: `${STRUCT}#L87`,
  freezeRules: `${STRUCT}#L91`,
  unfreezeRules: `${STRUCT}#L95`,
  destroyFrozenFundsRules: `${STRUCT}#L99`,
  emergencyActionRules: `${STRUCT}#L103`,
  description: `${STRUCT}#L115`
}

export const tokenFaqGroups = [
  {
    title: 'Essentials',
    items: [
      {
        key: 'naming',
        question: 'What are the name and plural form for?',
        answer: 'They are the token\'s display names, stored under `conventions.localizations.en` (singular and plural). Names are 3–25 ASCII characters with no spaces.'
      },
      {
        key: 'decimals',
        question: 'What does "decimals" mean?',
        answer: 'How many fractional digits the token supports, like cents on a dollar. Max is 16; DASH itself uses 8. Your supply inputs are multiplied by 10^`decimals` before going on chain.'
      },
      {
        key: 'baseSupply',
        question: 'What is the base supply?',
        answer: 'The initial token supply minted at creation (`baseSupply`). It goes to your identity, and you can transfer it or mint more later if minting is enabled.'
      },
      {
        key: 'maxSupply',
        question: 'Can the supply be unlimited?',
        answer: 'Yes. Leave "Max supply" off and `maxSupply` is `null` — the supply is unbounded unless minting rules constrain it. If you set a cap, it can never be reduced below the base supply.'
      },
      {
        key: 'description',
        question: 'Where is the description shown?',
        answer: 'The optional `description` describes the token\'s purpose and is shown on the token page. Leave it empty and it is stored as `null`.'
      }
    ]
  },
  {
    title: 'Permissions',
    items: [
      {
        key: 'minting',
        question: 'Can I mint more tokens after creation?',
        answer: 'Yes, if "Mintable" is on — then `manualMintingRules` is set to `ContractOwner` (you). Turn it off and minting is locked forever (`NoOne`), fixing the supply.'
      },
      {
        key: 'burning',
        question: 'Can tokens be burned?',
        answer: 'If "Burnable" is on, `manualBurningRules` is `ContractOwner` and the owner can burn tokens — useful for redemption or deflationary models. Off means `NoOne` can burn.'
      },
      {
        key: 'freeze',
        question: 'What do freeze / unfreeze do?',
        answer: 'With "Freezable" on, `freezeRules` and `unfreezeRules` let the owner freeze and unfreeze individual holder balances — useful for anti-fraud or compliance. Off locks both to `NoOne`.'
      },
      {
        key: 'shouldCapitalize',
        question: 'What does "Capitalize singular form" do?',
        answer: 'Sets `shouldCapitalize` in the English localization, hinting to clients that the singular name should render with a capital letter (e.g. `MyToken`, not `mytoken`). It is metadata only — chain logic never depends on it.'
      },
      {
        key: 'startAsPaused',
        question: 'Why would my token start paused?',
        answer: 'If "Start paused" is on, `startAsPaused` is true and the token is created paused — transfers are disallowed until explicitly unpaused via an emergency action.'
      },
      {
        key: 'destroyFrozen',
        question: 'What is "Burn frozen funds"?',
        answer: 'It sets `destroyFrozenFundsRules` so the owner can destroy tokens that are currently frozen. It only makes sense together with Freezable.'
      },
      {
        key: 'emergency',
        question: 'What is the emergency action / pause?',
        answer: '`emergencyActionRules` governs who may invoke emergency actions such as pausing all token operations at once. With "Emergency pause" on, that is the owner.'
      },
      {
        key: 'transferToFrozen',
        question: 'What does "Allow transfer to frozen balance" do?',
        answer: '`allowTransferToFrozenBalance` controls whether incoming mints and transfers can land on a balance that is currently frozen. Off (default) bounces them; on lets them accumulate while still being frozen.'
      }
    ]
  },
  {
    title: 'Distribution',
    items: [
      {
        key: 'distribution',
        question: 'What are the distribution rules?',
        answer: '`distributionRules` defines perpetual and pre-programmed distribution logic, the destination identity for new tokens, and who may change direct-purchase pricing. With "Allow direct purchase" on, the owner can set a price and accept purchases.'
      },
      {
        key: 'destination',
        question: 'Where do newly minted tokens land?',
        answer: 'By default `newTokensDestinationIdentity` is `null` and mints go to the contract owner. Set it to an Identity ID in Advanced to redirect all mints to that identity — useful for treasury / vault setups.'
      },
      {
        key: 'preProgrammed',
        question: 'What is pre-programmed distribution?',
        answer: '`preProgrammedDistribution` is a list of one-off scheduled distributions: each row mints a fixed amount to a specific identity at a specific time. Useful for airdrops, vesting unlocks, or any "release X tokens to Y on date Z" rule that should live in the contract itself.'
      },
      {
        key: 'perpetual',
        question: 'What is perpetual distribution?',
        answer: 'A recurring auto-mint: every `interval` the contract emits a fixed amount to the chosen recipient. The full DPP schema supports several function shapes (linear, exponential, stepwise, …) and block- / epoch-based timing; our Advanced UI exposes only the most common slice — Time-based + FixedAmount + Owner/Identity recipient. For other shapes use Dash Evo Tool.'
      },
      {
        key: 'marketplace',
        question: 'Can the token be traded?',
        answer: '`marketplaceRules` defines the trade mode. The preview defaults to `NotTradeable`; the owner controls whether and how trading is enabled.'
      }
    ]
  },
  {
    title: 'Logging',
    items: [
      {
        key: 'keepsHistory',
        question: 'What does history tracking record?',
        answer: '`keepsHistory` controls which actions are recorded on chain: transfers, freezes, mints, burns, direct pricing and direct purchases. By default the preview keeps all of them.'
      },
      {
        key: 'historyToggles',
        question: 'Can I disable specific history streams?',
        answer: 'Yes. `keepsHistory` is six independent flags (transfers, freezes, mints, burns, direct pricing, direct purchases). Disable any of them in Advanced if you do not need that audit trail. These are about *audit recording*, not about whether the action is allowed — the latter is controlled by Mintable / Burnable / Freezable in Features.'
      }
    ]
  }
]
