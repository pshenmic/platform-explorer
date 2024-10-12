module.exports = class ConnectionData {
  host
  status

  constructor (host, status) {
    this.host = host
    this.status = status
  }
}
