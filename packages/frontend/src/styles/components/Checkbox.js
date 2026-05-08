import { colors } from '../colors'

const Checkbox = {
  baseStyle: {
    control: {
      borderRadius: 10,
      padding: '14px',
      backgroundColor: colors.gray[800],

      _checked: {
        borderWidth: 1,
        borderColor: colors.brand.normal,
        backgroundColor: `rgba(${colors.brand['normal-rgb']}, 0.2)`
      }
    },
    icon: {
      width: '14px !important',
      height: '10px !important',
      color: colors.brand.normal,
      strokeWidth: '1.5px !important'
    },
    label: {
      color: colors.gray[250]
    }
  }
}

export default Checkbox
