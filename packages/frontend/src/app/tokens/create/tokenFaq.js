// In-app FAQ for the token configuration fields shown in the JSON preview.
//
// Why this exists: docs.dash.org documents token *operations* (mint / burn /
// transfer state transitions) but NOT the configuration fields a token is
// created with. Those fields live only in the rs-dpp source, where each field
// of `TokenConfigurationV0` carries a /// doc comment. The answers below are
// based on those comments plus practical guidance.

// docs.dash.org token reference — only its "Constants and Limits" section is
// relevant to configuration (value limits); the rest is about operations.
export const TOKEN_LIMITS_DOC_URL =
  'https://docs.dash.org/projects/platform/en/stable/docs/protocol-ref/token.html#token-constants-and-limits'

// rs-dpp token config sources. Fields live across three structs, so we need
// three base files. Line numbers verified via `grep -n` against master; if they
// drift the link still lands in the right file. Value literals (ContractOwner,
// NoOne, null, NotTradeable, …) are intentionally absent from the map below so
// they render as plain text, not links.
const BASE =
  'https://github.com/dashpay/platform/blob/master/packages/rs-dpp/src/data_contract/associated_token'
const STRUCT = `${BASE}/token_configuration/v0/mod.rs`
const CONVENTION = `${BASE}/token_configuration_convention/v0/mod.rs`
const LOCALIZATION = `${BASE}/token_configuration_localization/v0/mod.rs`

// The TokenConfigurationV0 struct — the canonical definition of every field.
export const STRUCT_URL = STRUCT

// Field name (as written in answers, between backticks) → deep link to its
// declaration line.
export const FIELD_SOURCE = {
  conventions: `${STRUCT}#L37`,
  // decimals & names live in their own structs, not in TokenConfigurationV0.
  decimals: `${CONVENTION}#L39`,
  'conventions.decimals': `${CONVENTION}#L39`,
  'conventions.localizations.en': `${LOCALIZATION}#L24`,
  baseSupply: `${STRUCT}#L45`,
  maxSupply: `${STRUCT}#L51`,
  keepsHistory: `${STRUCT}#L55`,
  startAsPaused: `${STRUCT}#L61`,
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

// FAQ grouped into sections. Field names referenced in answers are wrapped in
// `backticks`; FaqView turns the ones present in FIELD_SOURCE into links.
export const tokenFaqGroups = [
  {
    title: 'Naming & display',
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
      }
    ]
  },
  {
    title: 'Supply',
    items: [
      {
        key: 'baseSupply',
        question: 'What is the base supply?',
        answer: 'The initial token supply minted at creation (`baseSupply`). It goes to your identity, and you can transfer it or mint more later if minting is enabled.'
      },
      {
        key: 'maxSupply',
        question: 'Can the supply be unlimited?',
        answer: 'Yes. Leave "Max supply" off and `maxSupply` is `null` — the supply is unbounded unless minting rules constrain it. If you set a cap, it can never be reduced below the base supply.'
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
        key: 'destroyFrozen',
        question: 'What is "Burn frozen funds"?',
        answer: 'It sets `destroyFrozenFundsRules` so the owner can destroy tokens that are currently frozen. It only makes sense together with Freezable.'
      },
      {
        key: 'emergency',
        question: 'What is the emergency action / pause?',
        answer: '`emergencyActionRules` governs who may invoke emergency actions such as pausing all token operations at once. With "Emergency pause" on, that is the owner.'
      }
    ]
  },
  {
    title: 'Lifecycle & rules',
    items: [
      {
        key: 'startAsPaused',
        question: 'Why would my token start paused?',
        answer: 'If "Start paused" is on, `startAsPaused` is true and the token is created paused — transfers are disallowed until explicitly unpaused via an emergency action.'
      },
      {
        key: 'keepsHistory',
        question: 'What does history tracking record?',
        answer: '`keepsHistory` controls which actions are recorded on chain: transfers, freezes, mints, burns, direct pricing and direct purchases. By default the preview keeps all of them.'
      },
      {
        key: 'distribution',
        question: 'What are the distribution rules?',
        answer: '`distributionRules` defines perpetual and pre-programmed distribution logic, the destination identity for new tokens, and who may change direct-purchase pricing. With "Allow direct purchase" on, the owner can set a price and accept purchases.'
      },
      {
        key: 'marketplace',
        question: 'Can the token be traded?',
        answer: '`marketplaceRules` defines the trade mode. The preview defaults to `NotTradeable`; the owner controls whether and how trading is enabled.'
      },
      {
        key: 'description',
        question: 'Where is the description shown?',
        answer: 'The optional `description` describes the token\'s purpose and is shown on the token page. Leave it empty and it is stored as `null`.'
      }
    ]
  }
]
