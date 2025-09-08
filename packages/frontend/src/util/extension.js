export const ExtensionStatusEnum = {
  CONNECTED: 'CONNECTED',
  NONE: 'NONE'
}
export const checkPlatformExtension = () => window?.dashPlatformExtension ? ExtensionStatusEnum.CONNECTED : ExtensionStatusEnum.NONE
