type CopyResult = { status: boolean, message?: unknown }

function copyToClipboard (
  copyText = '',
  callback?: (result: CopyResult) => void
): void {
  if (!callback) callback = () => {}

  try {
    navigator.clipboard.writeText(copyText)
    callback({ status: true })
  } catch (err) {
    callback({ status: false, message: err })
  }
}

export default copyToClipboard
