class ResponseErrorNotFound extends Error {
  constructor (message = 'Not Found') {
    super(message)
    this.name = 'ResponseErrorNotFound'
  }
}

class ResponseErrorTimeout extends Error {
  constructor (message = 'Request to Tenderdash RPC is timed out') {
    super(message)
    this.name = 'ResponseErrorTimeout'
  }
}

class ResponseErrorInternalServer extends Error {
  constructor (message = 'Internal Server Error') {
    super(message)
    this.name = 'ResponseErrorInternalServer'
  }
}

class ResponseErrorBadRequest extends Error {
  constructor (message = 'Bad Request') {
    super(message)
    this.name = 'ResponseErrorBadRequest'
  }
}

export {
  ResponseErrorNotFound,
  ResponseErrorTimeout,
  ResponseErrorInternalServer,
  ResponseErrorBadRequest
}
