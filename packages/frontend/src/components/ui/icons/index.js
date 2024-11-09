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
  <Icon viewBox='0 0 6 10' {...props}>
    <svg width='6' height='10' viewBox='0 0 6 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M1 9L5 5L1 1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
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

export {
  CalendarIcon,
  CalendarIcon2,
  CircleIcon,
  ArrowCornerIcon,
  CloseIcon,
  ChevronIcon
}
