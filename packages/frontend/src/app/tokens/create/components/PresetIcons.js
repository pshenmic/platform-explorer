// Small stroke icons for the preset cards. Feature-scoped (Chakra's icon set
// lacks coin/parachute/etc.), 24×24, currentColor so they inherit card state.

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

const Coin = (props) => (
  <svg {...base} {...props}>
    <circle cx='12' cy='12' r='9'/>
    <path d='M12 7v10M9.5 9.5h3.2a1.8 1.8 0 0 1 0 3.6H9.5h3.5a1.8 1.8 0 0 1 0 3.6H9.5'/>
  </svg>
)

const Lock = (props) => (
  <svg {...base} {...props}>
    <rect x='5' y='11' width='14' height='9' rx='2'/>
    <path d='M8 11V8a4 4 0 0 1 8 0v3'/>
  </svg>
)

const Repeat = (props) => (
  <svg {...base} {...props}>
    <path d='M17 3l3 3-3 3'/>
    <path d='M20 6H8a4 4 0 0 0-4 4v1'/>
    <path d='M7 21l-3-3 3-3'/>
    <path d='M4 18h12a4 4 0 0 0 4-4v-1'/>
  </svg>
)

const Parachute = (props) => (
  <svg {...base} {...props}>
    <path d='M3 11a9 9 0 0 1 18 0'/>
    <path d='M3 11l9 5 9-5'/>
    <path d='M12 3v13M8 11l4 5 4-5'/>
    <path d='M10 20h4'/>
  </svg>
)

const Dollar = (props) => (
  <svg {...base} {...props}>
    <circle cx='12' cy='12' r='9'/>
    <path d='M12 7v10'/>
    <path d='M14.5 9.2a2.6 2.6 0 0 0-2.5-1.2c-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2a2.6 2.6 0 0 1-2.5-1.2'/>
  </svg>
)

export const PRESET_ICONS = {
  coin: Coin,
  lock: Lock,
  repeat: Repeat,
  parachute: Parachute,
  dollar: Dollar
}
