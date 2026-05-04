function copyToClipboard (copyText = '', callback) {
  if (!callback) callback = () => {}

  try {
    navigator.clipboard.writeText(copyText)
    callback({ status: true })
  } catch (err) {
    callback({ status: false, message: err })
  }
}

export default copyToClipboard
