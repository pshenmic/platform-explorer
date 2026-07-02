export const ExtensionStatusEnum = {
  CONNECTED: 'CONNECTED',
  NONE: 'NONE'
} as const

export type ExtensionStatus = 'CONNECTED' | 'NONE'

export const checkPlatformExtension = (): ExtensionStatus =>
  typeof window !== 'undefined' && window.dashPlatformExtension
    ? ExtensionStatusEnum.CONNECTED
    : ExtensionStatusEnum.NONE
