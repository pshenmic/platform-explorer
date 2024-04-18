const ValidatorsDAO = require('../dao/ValidatorsDAO')

class ValidatorsController {
  constructor (knex) {
    this.validatorsDAO = new ValidatorsDAO(knex)
  }

  getValidatorByProTxHash = async (request, response) => {
    const { proTxHash } = request.params

    const validator = await this.validatorsDAO.getValidatorByProTxHash(proTxHash)

    if (!validator) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(validator)
  }

  getValidators = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc' } = request.query

    if (order !== 'asc' && order !== 'desc') {
      return response.status(400).send({ message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values` })
    }

    const identities = await this.validatorsDAO.getValidators(Number(page), Number(limit), order)

    response.send(identities)
  }
}

module.exports = ValidatorsController
