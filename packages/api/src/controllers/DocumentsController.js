const DocumentsDAO = require('../dao/DocumentsDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')

class DocumentsController {
  constructor(knex, dapi) {
    this.documentsDAO = new DocumentsDAO(knex)
    this.dataContractsDAO = new DataContractsDAO(knex)
    this.dapi = dapi
  }

  getDocumentByIdentifier = async (request, response) => {
    const {identifier} = request.params

    const document = await this.documentsDAO.getDocumentByIdentifier(identifier)

    if (!document) {
      return response.status(404).send({message: 'not found'})
    }

    response.send(document)
  }

  getDocumentsByDataContract = async (request, response) => {
    const {identifier} = request.params
    const {page = 1, limit = 10, order = 'asc'} = request.query

    const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }

  getDocumentsWithTypeByDataContract = async (request, response) => {
    const {identifier, type} = request.params
    const {page = 1, limit = 10, orderData = []} = request.query

    const dataContractData = await this.dataContractsDAO.getDataContractByIdentifier(identifier)

    if (!dataContractData?.schema) {
      return response.status(404).send({message: 'not found'})
    }

    const documentsCount = await this.documentsDAO.getDocumentsCountByDataContract(identifier)

    if (documentsCount !== 0 && limit * page > documentsCount) {
      return response.status(400).send({message: `out of range (${documentsCount})`})
    }

    const documentSchemas = JSON.parse(dataContractData.schema)
    const documentTypes = Object.keys(documentSchemas)

    if (!documentTypes.includes(type)) {
      return response.status(400).send({message: `type not found (${documentTypes.join(', ')})`})
    }

    const documents = await this.dapi.getDocuments(
      type,
      documentObject,
      options
    )

    response.send(documents)
  }
}

module.exports = DocumentsController
