import { colors, badgeColors } from '../colors'

const Progress = {
  baseStyle: props => {
    const { colorScheme } = props
    const trackColor = {
      red: badgeColors.red.bg,
      green: badgeColors.green.bg,
      gray: badgeColors.gray.bg,
      blue: `rgba(${colors.brand['normal-rgb']}, .3)`,
      yellow: badgeColors.yellow.bg,
      orange: badgeColors.orange.bg,
      emerald: badgeColors.emerald.bg
    }
    const filledColor = {
      red: badgeColors.red.text,
      green: badgeColors.green.text,
      gray: badgeColors.gray.text,
      blue: colors.brand.normal,
      yellow: badgeColors.yellow.text,
      orange: badgeColors.orange.text,
      emerald: badgeColors.emerald.text
    }

    return {
      track: {
        bg: trackColor?.[colorScheme] || trackColor.blue
      },
      filledTrack: {
        bg: filledColor?.[colorScheme] || filledColor.blue
      }
    }
  }
}

export default Progress
