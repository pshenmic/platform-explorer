import { DashPlatformSDK } from 'dash-platform-sdk/bundle.min.js'

let dashPlatformSDK

export const useSDK = () => {

  if (window.dashPlatformSDK) {
    return window.dashPlatformSDK
  }

  if (!dashPlatformSDK) {
    dashPlatformSDK = new DashPlatformSDK()
  }

  return dashPlatformSDK
}