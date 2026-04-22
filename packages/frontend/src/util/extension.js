export const ExtensionStatusEnum = {
  CONNECTED: 'CONNECTED',
  NONE: 'NONE'
}
export const checkPlatformExtension = () =>
  typeof window !== 'undefined' && window.dashPlatformExtension
    ? ExtensionStatusEnum.CONNECTED
    : ExtensionStatusEnum.NONE
