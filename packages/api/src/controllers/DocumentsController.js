const DocumentsDAO = require('../dao/DocumentsDAO')

class DocumentsController {
  constructor (knex) {
    this.documentsDAO = new DocumentsDAO(knex)
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
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }
}

module.exports = DocumentsController
