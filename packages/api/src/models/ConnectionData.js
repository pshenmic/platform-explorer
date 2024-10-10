module.exports = class ConnectionData {
  serviceConnectable
  p2pConnectable
  httpConnectable

  constructor (serviceConnectable, p2pConnectable, httpConnectable, p2pResponse) {
    this.serviceConnectable = serviceConnectable
    this.p2pConnectable = p2pConnectable
    this.httpConnectable = httpConnectable
  }

  static fromObject ({ serviceConnectable, p2pConnectable, httpConnectable }) {
    return new ConnectionData(serviceConnectable, p2pConnectable, httpConnectable)
  }
}
