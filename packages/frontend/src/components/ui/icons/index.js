import { Icon } from '@chakra-ui/react'

const CalendarIcon = (props) => (
  <Icon viewBox='0 0 12 14' {...props}>
    <path
      fill='currentColor'
      d='M3.42857 0.143066V0.571638V1.85735H8.57143V0.571638V0.143066H9.42857V0.571638V1.85735H11.1429H12V2.71449V4.42878V5.28592V13.0002V13.8574H11.1429H0.857143H0V13.0002V5.28592V4.42878V2.71449V1.85735H0.857143H2.57143V0.571638V0.143066H3.42857ZM11.1429 5.28592H0.857143V13.0002H11.1429V5.28592ZM11.1429 2.71449H0.857143V4.42878H11.1429V2.71449Z'
    />
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
  <Icon viewBox='0 0 18 18' {...props}>
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect width='18' height='18' rx='4' fill='#F45858' fillOpacity='0.2'/>
      <path d='M9.06951 10L9.0695 4.86092' stroke='#F45858' strokeWidth='2' strokeLinecap='round'/>
      <path d='M9.06951 13L9.06951 13.0102' stroke='#F45858' strokeWidth='2' strokeLinecap='round'/>
    </svg>
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
      <path d='M4.86093 8.74967L12.5 8.74993M12.5 8.74993L9.5 5.74993M12.5 8.74993L9.5 11.7499' stroke='#2CBBFF' strokeWidth='2' strokeLinecap='round' stroke-linejoin='round'/>
    </svg>
  </Icon>
)

export {
  CalendarIcon,
  CircleIcon,
  ArrowCornerIcon,
  SuccessIcon,
  ErrorIcon,
  QueuedIcon,
  PooledIcon,
  BroadcastedIcon
}
