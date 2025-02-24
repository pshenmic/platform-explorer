import { Icon } from '@chakra-ui/react'

const CalendarIcon = (props) => (
  <Icon viewBox='0 0 12 14' {...props}>
    <path
      fill='currentColor'
      d='M3.42857 0.143066V0.571638V1.85735H8.57143V0.571638V0.143066H9.42857V0.571638V1.85735H11.1429H12V2.71449V4.42878V5.28592V13.0002V13.8574H11.1429H0.857143H0V13.0002V5.28592V4.42878V2.71449V1.85735H0.857143H2.57143V0.571638V0.143066H3.42857ZM11.1429 5.28592H0.857143V13.0002H11.1429V5.28592ZM11.1429 2.71449H0.857143V4.42878H11.1429V2.71449Z'
    />
  </Icon>
)

const CalendarIcon2 = (props) => (
  <Icon viewBox='0 0 16 16' {...props}>
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fill='currentColor' d='M14.0281 2H13V3.27187C13 3.975 12.275 4.5 11.525 4.5C10.775 4.5 10 3.975 10 3.27187V2H6V3.27187C6 3.975 5.25 4.5 4.5 4.5C3.75 4.5 3 3.975 3 3.27187V2H1.97187C1.43437 2 1 2.41563 1 2.91875V14.0906C1 14.5938 1.43437 15 1.97187 15H14.0281C14.5656 15 15 14.5938 15 14.0875V2.91875C15 2.41563 14.5656 2 14.0281 2ZM13.5 13.1219C13.5 13.3281 13.3188 13.4969 13.1 13.4969L2.89687 13.5C2.67812 13.4906 2.5 13.325 2.5 13.1187V5.88438C2.5 5.66875 2.68438 5.5 2.91563 5.5H13.0875C13.3156 5.5 13.5 5.66563 13.5 5.87813V13.1219Z'/>
      <path fill='currentColor' d='M5.5 3C5.5 3.55312 5.05313 4 4.5 4C3.94687 4 3.5 3.55312 3.5 3V2C3.5 1.44687 3.94687 1 4.5 1C5.05313 1 5.5 1.44687 5.5 2V3Z'/>
      <path fill='currentColor' d='M12.5 3C12.5 3.55312 12.0531 4 11.5 4C10.9469 4 10.5 3.55312 10.5 3V2C10.5 1.44687 10.9469 1 11.5 1C12.0531 1 12.5 1.44687 12.5 2V3Z'/>
    </svg>
  </Icon>
)

const CloseIcon = (props) => (
  <Icon viewBox='0 0 10 10' {...props}>
    <svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M1 1L9 9' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
      <path d='M9 1L1 9' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
    </svg>
  </Icon>
)

const ChevronIcon = (props) => (
  <Icon viewBox='0 0 6 10' fill='none' {...props}>
    <path d='M1 9L5 5L1 1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
  </Icon>
)

const ChevronIcon2 = (props) => (
  <Icon width='7' height='10' viewBox='0 0 7 10' fill='none' {...props}>
    <path d='M1.5 9L5.5 5L1.5 1' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
  </Icon>
)

const CircleIcon = (props) => (
  <Icon viewBox='0 0 8 8' {...props}>
    <circle fill='currentColor' cx='4' cy='4' r='4'/>
  </Icon>
)

const ArrowCornerIcon = (props) => (
  <Icon viewBox='0 0 10 11' {...props}>
    <path
      fill='currentColor'
      d='M2.08127 0.5C1.62282 0.5 1.24772 0.875098 1.24772 1.33355C1.24772 1.792 1.62282 2.1671 2.08127 2.1671H7.15551L0.242251 9.08036C-0.0807502 9.40336 -0.0807502 9.93475 0.242251 10.2577C0.565251 10.5808 1.09664 10.5808 1.41964 10.2577L8.3329 3.34449V8.8355C8.3329 9.29396 8.708 9.66905 9.16645 9.66905C9.6249 9.66905 10 9.29396 10 8.8355V1.33355C10 0.875098 9.6249 0.5 9.16645 0.5H2.08127Z'
    />
  </Icon>
)

const SuccessIcon = (props) => (
  <Icon viewBox='0 0 18 18' {...props}>
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='9' cy='9' r='9' fill='#1CC400' fillOpacity='0.2'/>
      <path d='M5 8.5L8 11.5L13.5 6' stroke='#1CC400' strokeWidth='2' strokeLinecap='round'/>
    </svg>
  </Icon>
)

const ErrorIcon = (props) => (
  <Icon viewBox='0 0 18 18' width='18' height='18' fill='none' {...props}>
    <rect width='18' height='18' rx='4' fill='#F45858' fillOpacity='0.2'/>
    <path d='M9.06951 10L9.0695 4.86092' stroke='#F45858' strokeWidth='2' strokeLinecap='round'/>
    <path d='M9.06951 13L9.06951 13.0102' stroke='#F45858' strokeWidth='2' strokeLinecap='round'/>
  </Icon>
)

const QueuedIcon = (props) => (
  <Icon viewBox='0 0 18 18' {...props}>
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect width='18' height='18' rx='4' fill='#F4A358' fillOpacity='0.2'/>
      <path d='M11.6756 12.6482C11.8311 12.8601 12.1306 12.9075 12.3268 12.7326C13.1311 12.0158 13.6857 11.055 13.9009 9.99071C14.1476 8.77034 13.9301 7.50182 13.2909 6.43333C12.6518 5.36484 11.637 4.57324 10.4451 4.2134C9.25315 3.85356 7.96985 3.95136 6.84622 4.48768C5.72259 5.024 4.83949 5.96024 4.36966 7.11325C3.89983 8.26626 3.87708 9.55308 4.30587 10.722C4.73466 11.8909 5.58412 12.8577 6.6881 13.4334C7.65084 13.9355 8.74673 14.1085 9.80981 13.934C10.0691 13.8914 10.2207 13.6287 10.1537 13.3746C10.0867 13.1205 9.82636 12.9718 9.56614 13.0086C8.7336 13.1262 7.88063 12.982 7.12813 12.5896C6.23429 12.1235 5.5465 11.3406 5.19933 10.3942C4.85216 9.44781 4.87057 8.40592 5.25098 7.47237C5.63138 6.53882 6.3464 5.78078 7.25616 5.34654C8.16592 4.91231 9.20497 4.83312 10.17 5.12447C11.1351 5.41582 11.9567 6.05674 12.4742 6.92186C12.9917 7.78698 13.1678 8.81405 12.9681 9.80215C12.7999 10.634 12.3756 11.3878 11.7605 11.9612C11.5683 12.1404 11.5202 12.4362 11.6756 12.6482Z' fill='#F49A58'/>
    </svg>
  </Icon>
)

const PooledIcon = (props) => (
  <Icon viewBox='0 0 18 18' {...props}>
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect width='18' height='18' rx='4' fill='#008DE4' fillOpacity='0.2'/>
      <path d='M14 7L12.4328 6.01491C11.4484 5.39611 10.1941 5.40565 9.21918 6.03935V6.03935C8.30752 6.63193 7.14565 6.6816 6.18674 6.16899L4 5' stroke='#2CBBFF' strokeLinecap='round'/>
      <path d='M14 10L12.4328 9.01491C11.4484 8.39611 10.1941 8.40565 9.21918 9.03935V9.03935C8.30752 9.63193 7.14565 9.6816 6.18674 9.16899L4 8' stroke='#2CBBFF' strokeLinecap='round'/>
      <path d='M14 13L12.4328 12.0149C11.4484 11.3961 10.1941 11.4057 9.21918 12.0393V12.0393C8.30752 12.6319 7.14565 12.6816 6.18674 12.169L4 11' stroke='#2CBBFF' strokeLinecap='round'/>
    </svg>
  </Icon>
)

const BroadcastedIcon = (props) => (
  <Icon viewBox='0 0 18 18' {...props}>
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect width='18' height='18' rx='4' fill='#008DE4' fillOpacity='0.2'/>
      <path d='M4.86093 8.74967L12.5 8.74993M12.5 8.74993L9.5 5.74993M12.5 8.74993L9.5 11.7499' stroke='#2CBBFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  </Icon>
)

const CheckmarkIcon = (props) => (
  <Icon viewBox='0 0 12 13' {...props}>
    <svg width='12' height='13' viewBox='0 0 12 13' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='6' cy='6.5' r='6' fill='#1CC400'/>
      <path d='M3.33301 6.16667L5.33301 8.16667L8.99967 4.5' stroke='white' strokeWidth='1.33333' strokeLinecap='round'/>
    </svg>
  </Icon>
)

const ErrorCircleIcon = (props) => (
  <Icon viewBox='0 0 12 13' {...props}>
    <svg width='12' height='13' viewBox='0 0 12 13' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='6' cy='6.5' r='6' fill='#F45858'/>
      <path d='M6 8.05273L6 3.05273' stroke='white' strokeLinecap='round'/>
      <path d='M6 9.94737L6 9.94727' stroke='white' strokeLinecap='round'/>
    </svg>
  </Icon>
)

const BigClockIcon = (props) => (
  <Icon viewBox='0 0 35 34' {...props}>
    <svg width='35' height='34' viewBox='0 0 35 34' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd'
        d='M8 0C3.58172 0 0 3.58172 0 8V26C0 30.4183 3.58172 34 8 34H26C30.4183 34 34 30.4183 34 26V8C34 3.58172 30.4183 0 26 0H8ZM8 1C4.13401 1 1 4.13401 1 8V26C1 29.866 4.13401 33 8 33H26C29.866 33 33 29.866 33 26V8C33 4.13401 29.866 1 26 1H8Z'
        fill='#93AAB2'/>
      <path d='M34 10C34.5523 10 35 10.4477 35 11V17C35 17.5523 34.5523 18 34 18V10Z' fill='#93AAB2'/>
      <path d='M16 12C16 11.4477 16.4477 11 17 11C17.5523 11 18 11.4477 18 12V19H16V12Z' fill='white'/>
      <path d='M26 19C26.5523 19 27 19.4477 27 20C27 20.5523 26.5523 21 26 21L16 21L16 19L26 19Z' fill='white'/>
    </svg>
  </Icon>
)

const PshenmicLogoIcon = (props) => (
  <Icon viewBox='0 0 95 8' {...props}>
    <path
      d='M0 8V2H6V3H7V5H6V6H2V8H0ZM2 5H5V3H2V5ZM8 7V6H13V5H9V4H8V3H9V2H14V3H10V4H14V5H15V6H14V7H8ZM16 7V0H18V2H22V3H23V7H21V3H18V7H16ZM25 7V6H24V3H25V2H30V3H31V5H26V6H30V7H25ZM26 4H29V3H26V4ZM32 7V2H38V3H39V7H37V3H34V7H32ZM40 7V2H46V3H47V7H45V3H44V7H42V3H41V7H40ZM51 1V0H53V1H51ZM49 7V6H51V3H50V2H53V6H55V7H49ZM57 7V6H56V3H57V2H63V3H58V6H63V7H57ZM66 7V5H68V7H66ZM73 7V6H72V3H73V2H77V0H79V7H73ZM74 6H77V3H74V6ZM81 7V6H80V3H81V2H86V3H87V5H82V6H86V7H81ZM82 4H85V3H82V4ZM91 7V6H90V5H89V2H91V5H93V2H95V5H94V6H93V7H91Z'
      fill='currentColor'
    />
  </Icon>
)

const TransactionsIcon = (props) => (
  <Icon viewBox='0 0 28 25' width='28' height='25' fill='none' {...props}>
    <svg width='28' height='25' viewBox='0 0 28 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M4.08358 24.0306L4.08358 18.1973L17.5002 18.1973M17.5002 18.1973L13.4169 22.2806M17.5002 18.1973L13.4169 14.1139M23.9169 10.6139L23.9169 4.7806L10.5002 4.7806M10.5002 4.7806L14.5836 8.86393M10.5002 4.7806L14.5836 0.697266M8.16699 4.78048C8.16699 6.71347 6.59999 8.28048 4.66699 8.28048C2.734 8.28048 1.16699 6.71347 1.16699 4.78048C1.16699 2.84748 2.734 1.28048 4.66699 1.28048C6.59999 1.28048 8.16699 2.84748 8.16699 4.78048ZM26.8337 18.1971C26.8337 20.1301 25.2667 21.6971 23.3337 21.6971C21.4007 21.6971 19.8337 20.1301 19.8337 18.1971C19.8337 16.2641 21.4007 14.6971 23.3337 14.6971C25.2667 14.6971 26.8337 16.2641 26.8337 18.1971Z'
        stroke='url(#paint0_linear_5608_6617)' strokeWidth='0.875'/>
      <defs>
        <linearGradient id='paint0_linear_5608_6617' x1='14.0003' y1='0.697266' x2='14.0003' y2='24.0306'
                        gradientUnits='userSpaceOnUse'>
          <stop stopColor='#008DE4'/>
          <stop offset='1' stopColor='#008DE4' stopOpacity='0.6'/>
        </linearGradient>
      </defs>
    </svg>
  </Icon>
)

const DocumentIcon = (props) => (
  <Icon viewBox='0 0 20 27' width='20' height='27' fill='none' {...props}>
    <path
      d='M11.7503 0.529297V8.11263H19.3337M11.7503 0.529297L19.3337 8.11263M11.7503 0.529297H0.666992V26.196H19.3337V8.11263M4.75033 17.446H15.2503M4.75033 14.5293H15.2503M4.75033 20.3626H15.2503'
      stroke='url(#paint0_linear_5608_6624)' strokeWidth='0.875'/>
    <defs>
      <linearGradient id='paint0_linear_5608_6624' x1='10.0003' y1='0.529297' x2='10.0003' y2='26.196'
                      gradientUnits='userSpaceOnUse'>
        <stop stopColor='#008DE4'/>
        <stop offset='1' stopColor='#008DE4' stopOpacity='0.6'/>
      </linearGradient>
    </defs>
  </Icon>
)

export {
  CalendarIcon,
  CalendarIcon2,
  CircleIcon,
  ArrowCornerIcon,
  SuccessIcon,
  ErrorIcon,
  QueuedIcon,
  PooledIcon,
  BroadcastedIcon,
  CloseIcon,
  ChevronIcon,
  ChevronIcon2,
  BigClockIcon,
  CheckmarkIcon,
  ErrorCircleIcon,
  PshenmicLogoIcon,
  TransactionsIcon,
  DocumentIcon
}
