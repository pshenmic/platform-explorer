const DocumentsDAO = require('../dao/DocumentsDAO')

class DocumentsController {
  constructor (knex, client) {
    this.documentsDAO = new DocumentsDAO(knex, client)
  }

  getDocumentByIdentifier = async (request, response) => {
    const { identifier } = request.params

    const document = await this.documentsDAO.getDocumentByIdentifier(identifier)

    if (!document) {
      response.status(404).send({ message: 'not found' })
    }

    response.send(document)
  }

  getDocumentsByDataContract = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc', type_name: typeName } = request.query

    const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, typeName, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }

  getDocumentTransactions = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const transactions = await this.documentsDAO.getDocumentTransactions(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(transactions)
  }
}

module.exports = DocumentsController
