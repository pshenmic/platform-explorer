import { Icon, useId } from '@chakra-ui/react'

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

const TransactionsIcon = (props) => {
  const uniqueId = useId()
  return (
    <Icon viewBox='0 0 28 25' width='28' height='25' fill='none' {...props}>
      <svg width='28' height='25' viewBox='0 0 28 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M4.08358 24.0306L4.08358 18.1973L17.5002 18.1973M17.5002 18.1973L13.4169 22.2806M17.5002 18.1973L13.4169 14.1139M23.9169 10.6139L23.9169 4.7806L10.5002 4.7806M10.5002 4.7806L14.5836 8.86393M10.5002 4.7806L14.5836 0.697266M8.16699 4.78048C8.16699 6.71347 6.59999 8.28048 4.66699 8.28048C2.734 8.28048 1.16699 6.71347 1.16699 4.78048C1.16699 2.84748 2.734 1.28048 4.66699 1.28048C6.59999 1.28048 8.16699 2.84748 8.16699 4.78048ZM26.8337 18.1971C26.8337 20.1301 25.2667 21.6971 23.3337 21.6971C21.4007 21.6971 19.8337 20.1301 19.8337 18.1971C19.8337 16.2641 21.4007 14.6971 23.3337 14.6971C25.2667 14.6971 26.8337 16.2641 26.8337 18.1971Z'
          stroke={`url(#${uniqueId})`} strokeWidth='0.875'/>
        <defs>
          <linearGradient id={uniqueId} x1='14.0003' y1='0.697266' x2='14.0003' y2='24.0306'
                          gradientUnits='userSpaceOnUse'>
            <stop stopColor='#008DE4'/>
            <stop offset='1' stopColor='#008DE4' stopOpacity='0.6'/>
          </linearGradient>
        </defs>
      </svg>
    </Icon>
  )
}

const DocumentIcon = (props) => {
  const uniqueId = useId()
  return (
    <Icon viewBox='0 0 20 27' width='20' height='27' fill='none' {...props}>
      <path
        d='M11.7503 0.529297V8.11263H19.3337M11.7503 0.529297L19.3337 8.11263M11.7503 0.529297H0.666992V26.196H19.3337V8.11263M4.75033 17.446H15.2503M4.75033 14.5293H15.2503M4.75033 20.3626H15.2503'
        stroke={`url(#${uniqueId})`} strokeWidth='0.875'/>
      <defs>
        <linearGradient id={uniqueId} x1='10.0003' y1='0.529297' x2='10.0003' y2='26.196'
                        gradientUnits='userSpaceOnUse'>
          <stop stopColor='#008DE4'/>
          <stop offset='1' stopColor='#008DE4' stopOpacity='0.6'/>
        </linearGradient>
      </defs>
    </Icon>
  )
}

const QueuePositionIcon = (props) => {
  const uniqueId = useId()
  return (
    <Icon viewBox='0 0 28 28' width='28' height='28' fill='none' {...props}>
      <svg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <g clipPath={`url(#clip0${uniqueId})`}>
          <path
            d='M0.700391 10.5L0.70039 17.5L24.3254 17.5L24.3254 14L24.3254 10.5L0.700391 10.5ZM25.0254 9.8L25.0254 10.5L25.0254 17.5L25.0254 18.2L24.3254 18.2L0.70039 18.2L0.000389792 18.2L0.000389822 17.5L0.000390128 10.5L0.000390159 9.8L0.700391 9.8L24.3254 9.8L25.0254 9.8ZM24.3254 0.7L0.700391 0.699999L0.700391 7.7L24.3254 7.7L24.3254 0.7ZM25.0254 0L25.0254 0.7L25.0254 7.7L25.0254 8.4L24.3254 8.4L0.700391 8.4L0.00039022 8.4L0.000390251 7.7L0.000390557 0.699999L0.000390587 -1.09388e-06L0.700391 -1.06328e-06L24.3254 -3.0598e-08L25.0254 0ZM14.4087 27.3L14.4087 20.3L0.70039 20.3L0.70039 27.3L14.4087 27.3ZM15.1087 20.3L15.1087 27.3L15.1087 28L14.4087 28L0.70039 28L0.000389363 28L0.000389394 27.3L0.0003897 20.3L0.000389731 19.6L0.70039 19.6L14.4087 19.6L15.1087 19.6L15.1087 20.3Z'
            fill={`url(#paint0${uniqueId})`}/>
          <path
            d='M25.0833 24.1009C19.1604 24.1009 23.423 24.1009 17.5 24.1009M17.5 24.1009L20.9125 20.4167M17.5 24.1009L20.9125 27.4167'
            stroke={`url(#paint1${uniqueId})`} strokeWidth='0.875'/>
        </g>
        <defs>
          <linearGradient id={`paint0${uniqueId}`} x1='25.0254' y1='14' x2='0.000390395' y2='14'
                          gradientUnits='userSpaceOnUse'>
            <stop stopColor='#008DE4'/>
            <stop offset='1' stopColor='#008DE4' stopOpacity='0.6'/>
          </linearGradient>
          <linearGradient id={`paint1${uniqueId}`} x1='25.0833' y1='11.2061' x2='25.0833' y2='27.4167'
                          gradientUnits='userSpaceOnUse'>
            <stop stopColor='#008DE4'/>
            <stop offset='1' stopColor='#008DE4' stopOpacity='0.6'/>
          </linearGradient>
          <clipPath id={`clip0${uniqueId}`}>
            <rect width='28' height='28' fill='white'/>
          </clipPath>
        </defs>
      </svg>
    </Icon>
  )
}

const MembersIcon = (props) => {
  const uniqueId = useId()
  return (
    <Icon viewBox='0 0 29 28' width='29' height='28' fill='none' {...props}>
      <svg width='29' height='28' viewBox='0 0 29 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <g clipPath={`url(#clip0${uniqueId})`}>
          <path
            d='M4 6.2999C4 5.55729 4.295 4.8451 4.8201 4.32C5.3452 3.7949 6.05739 3.4999 6.8 3.4999C7.54261 3.4999 8.2548 3.7949 8.7799 4.32C9.305 4.8451 9.6 5.55729 9.6 6.2999C9.6 7.0425 9.305 7.75469 8.7799 8.2798C8.2548 8.8049 7.54261 9.0999 6.8 9.0999C6.05739 9.0999 5.3452 8.8049 4.8201 8.2798C4.295 7.75469 4 7.0425 4 6.2999ZM10.3 6.2999C10.3 5.37164 9.93125 4.4814 9.27487 3.82502C8.6185 3.16865 7.72826 2.7999 6.8 2.7999C5.87174 2.7999 4.9815 3.16865 4.32513 3.82502C3.66875 4.4814 3.3 5.37164 3.3 6.2999C3.3 7.22815 3.66875 8.11839 4.32513 8.77477C4.9815 9.43115 5.87174 9.7999 6.8 9.7999C7.72826 9.7999 8.6185 9.43115 9.27487 8.77477C9.93125 8.11839 10.3 7.22815 10.3 6.2999ZM14.5 9.0999C15.4283 9.0999 16.3185 9.46865 16.9749 10.125C17.6313 10.7814 18 11.6716 18 12.5999C18 13.5282 17.6313 14.4184 16.9749 15.0748C16.3185 15.7311 15.4283 16.0999 14.5 16.0999C13.5717 16.0999 12.6815 15.7311 12.0251 15.0748C11.3687 14.4184 11 13.5282 11 12.5999C11 11.6716 11.3687 10.7814 12.0251 10.125C12.6815 9.46865 13.5717 9.0999 14.5 9.0999ZM14.5 16.7999C15.0516 16.7999 15.5977 16.6913 16.1073 16.4802C16.6168 16.2691 17.0798 15.9598 17.4698 15.5697C17.8599 15.1797 18.1692 14.7167 18.3803 14.2072C18.5914 13.6976 18.7 13.1514 18.7 12.5999C18.7 12.0483 18.5914 11.5022 18.3803 10.9926C18.1692 10.4831 17.8599 10.0201 17.4698 9.63005C17.0798 9.24004 16.6168 8.93067 16.1073 8.7196C15.5977 8.50853 15.0516 8.3999 14.5 8.3999C13.9484 8.3999 13.4023 8.50853 12.8927 8.7196C12.3832 8.93067 11.9202 9.24004 11.5302 9.63005C11.1401 10.0201 10.8308 10.4831 10.6197 10.9926C10.4086 11.5022 10.3 12.0483 10.3 12.5999C10.3 13.1514 10.4086 13.6976 10.6197 14.2072C10.8308 14.7167 11.1401 15.1797 11.5302 15.5697C11.9202 15.9598 12.3832 16.2691 12.8927 16.4802C13.4023 16.6913 13.9484 16.7999 14.5 16.7999ZM11.9319 18.8999H17.0637C19.9031 18.8999 22.2 21.1968 22.2 24.0318C22.2 24.2899 21.99 24.4999 21.7319 24.4999H7.26375C7.00563 24.4999 6.79562 24.2899 6.79562 24.0318C6.8 21.1968 9.09687 18.8999 11.9319 18.8999ZM11.9319 18.1999C8.71187 18.1999 6.1 20.8118 6.1 24.0318C6.1 24.6749 6.62062 25.1999 7.26812 25.1999H21.7362C22.3794 25.1999 22.9044 24.6793 22.9044 24.0318C22.9 20.8118 20.2881 18.1999 17.0681 18.1999H11.9362H11.9319ZM22.9 3.4999C23.6426 3.4999 24.3548 3.7949 24.8799 4.32C25.405 4.8451 25.7 5.55729 25.7 6.2999C25.7 7.0425 25.405 7.75469 24.8799 8.2798C24.3548 8.8049 23.6426 9.0999 22.9 9.0999C22.1574 9.0999 21.4452 8.8049 20.9201 8.2798C20.395 7.75469 20.1 7.0425 20.1 6.2999C20.1 5.55729 20.395 4.8451 20.9201 4.32C21.4452 3.7949 22.1574 3.4999 22.9 3.4999ZM22.9 9.7999C23.8283 9.7999 24.7185 9.43115 25.3749 8.77477C26.0313 8.11839 26.4 7.22815 26.4 6.2999C26.4 5.37164 26.0313 4.4814 25.3749 3.82502C24.7185 3.16865 23.8283 2.7999 22.9 2.7999C21.9717 2.7999 21.0815 3.16865 20.4251 3.82502C19.7687 4.4814 19.4 5.37164 19.4 6.2999C19.4 7.22815 19.7687 8.11839 20.4251 8.77477C21.0815 9.43115 21.9717 9.7999 22.9 9.7999ZM23.95 11.8999C26.0762 11.8999 27.8 13.6236 27.8 15.7499C27.8 15.9424 27.9575 16.0999 28.15 16.0999C28.3425 16.0999 28.5 15.9424 28.5 15.7499C28.5 13.2386 26.4612 11.1999 23.95 11.1999H19.925C19.9819 11.4274 20.03 11.6636 20.0562 11.8999H23.95ZM8.94375 11.8999C8.97437 11.6636 9.01812 11.4274 9.075 11.1999H5.05C2.53875 11.1999 0.5 13.2386 0.5 15.7499C0.5 15.9424 0.6575 16.0999 0.85 16.0999C1.0425 16.0999 1.2 15.9424 1.2 15.7499C1.2 13.6236 2.92375 11.8999 5.05 11.8999H8.94375Z'
            fill={`url(#paint0${uniqueId})`}/>
        </g>
        <defs>
          <linearGradient id={`paint0${uniqueId}`} x1='14.5' y1='2.7999' x2='14.5' y2='25.1999'
                          gradientUnits='userSpaceOnUse'>
            <stop stopColor='#008DE4'/>
            <stop offset='1' stopColor='#008DE4' stopOpacity='0.6'/>
          </linearGradient>
          <clipPath id={`clip0${uniqueId}`}>
            <rect width='28' height='28' fill='white' transform='translate(0.5)'/>
          </clipPath>
        </defs>
      </svg>
    </Icon>
  )
}

const BlockIcon = (props) => {
  const uniqueId = useId()
  return (
    <Icon viewBox='0 0 48 48' width='48' height='48' fill='none' {...props}>
      <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M44 13.8462L24 2L4 13.8462M44 13.8462L24 25.6923M44 13.8462V34.1538L24 46M4 13.8462L24 25.6923M4 13.8462V34.1538L24 46M24 25.6923V46'
          stroke={`url(#${uniqueId})`} strokeWidth='1.5' strokeLinecap='round'/>
        <defs>
          <linearGradient id={uniqueId} x1='24' y1='2' x2='24' y2='46' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#008DE4'/>
            <stop offset='1' stopColor='#008DE4' stopOpacity='0.6'/>
          </linearGradient>
        </defs>
      </svg>
    </Icon>
  )
}

const InfoIcon = ({ bg, ...props }) => (
  <Icon viewBox='0 0 16 16' width='16' height='16' color={'#008DE4'} {...props}>
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8Z'
        fill='currentColor'/>
      <path fillRule='evenodd' clipRule='evenodd'
            d='M7.99953 12.0011C8.49045 12.0011 8.88842 11.6032 8.88842 11.1122V7.3336C8.88842 6.84268 8.49045 6.44471 7.99953 6.44471C7.50861 6.44471 7.11064 6.84268 7.11064 7.3336V11.1122C7.11064 11.6032 7.50861 12.0011 7.99953 12.0011ZM7.99953 4.93447C8.49045 4.93447 8.88842 4.5365 8.88842 4.04558V4.00027C8.88842 3.50935 8.49045 3.11138 7.99953 3.11138C7.50861 3.11138 7.11064 3.50935 7.11064 4.00027V4.04558C7.11064 4.5365 7.50861 4.93447 7.99953 4.93447Z'
            fill='#181F22'/>
    </svg>
  </Icon>
)

const SearchIcon = (props) => (
  <Icon viewBox='0 0 14 14' width='14' height='14' color={'#008DE4'} {...props}>
    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd'
            d='M6.18748 10.4711C8.55327 10.4711 10.4711 8.55327 10.4711 6.18748C10.4711 3.82169 8.55327 1.90384 6.18748 1.90384C3.82169 1.90384 1.90384 3.82169 1.90384 6.18748C1.90384 8.55327 3.82169 10.4711 6.18748 10.4711ZM6.18748 12.375C9.60474 12.375 12.375 9.60474 12.375 6.18748C12.375 2.77023 9.60474 0 6.18748 0C2.77023 0 0 2.77023 0 6.18748C0 9.60474 2.77023 12.375 6.18748 12.375Z'
            fill='currentColor'/>
      <path fillRule='evenodd' clipRule='evenodd'
            d='M12.6538 14L9.79802 11.1442L11.1442 9.79802L14 12.6538L12.6538 14Z' fill='currentColor'/>
    </svg>
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
  DocumentIcon,
  QueuePositionIcon,
  MembersIcon,
  BlockIcon,
  InfoIcon,
  SearchIcon
}
