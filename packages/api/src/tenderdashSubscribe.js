const WebSocket = require('ws')
const {TENDERDASH_URL} = require("./constants");
const ServiceNotAvailableError = require("./errors/ServiceNotAvailableError");
const EventEmitter = require('node:events');

module.exports = class TenderdashWebSocket extends EventEmitter {
  initialMessage
  ws

  constructor (initialMessage) {
    super();

    // TODO:
    this.ws = new WebSocket('ws://127.0.0.1:36657/websocket');
    this.initialMessage = initialMessage

    this.ws.on('open', () => {
      if(initialMessage) {
        this.ws.send(JSON.stringify(this.initialMessage))
      }
    })

    this.ws.on('message', (data) => this.emit('message', data));

    this.ws.on('error', (e) => {
      console.error(e)
      throw new ServiceNotAvailableError()
    });
  }
}