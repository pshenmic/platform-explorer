const DocumentsDAO = require('../dao/DocumentsDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const Document = require('../models/Document')

class DocumentsController {
  constructor (client, knex, dapi) {
    this.documentsDAO = new DocumentsDAO(knex)
    this.datacContractsDAO = new DataContractsDAO(knex)
    this.client = client
    this.dapi = dapi
  }

  getDocumentByIdentifier = async (request, response) => {
    const { identifier } = request.params
    const { type_name: typeName, contract_id: contractId } = request.query

    const document = await this.documentsDAO.getDocumentByIdentifier(identifier)

    if (document) {
      return response.send(document)
    }

    if (!typeName || !contractId) {
      return response.status(404).send({ message: 'not found. Try to set type and data contract id' })
    }

    let dataContract

    if (contractId) {
      dataContract = await this.datacContractsDAO.getDataContractByIdentifier(contractId)
    }

    if (!dataContract) {
      return response.status(404).send({ message: 'data contract not found' })
    }

    const [documentFromDapi] = await this.dapi.getDocuments(
      typeName,
      {
        $format_version: '0',
        ownerId: dataContract.owner,
        id: dataContract.identifier,
        version: dataContract.version,
        documentSchemas: JSON.parse(dataContract.schema)
      },
      identifier,
      undefined,
      1
    )

    if (!documentFromDapi) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(Document.fromObject({
      dataContractIdentifier: dataContract.identifier,
      deleted: false,
      identifier: documentFromDapi?.getId(),
      isSystem: false,
      owner: documentFromDapi.getOwnerId(),
      revision: documentFromDapi.getRevision(),
      timestamp: documentFromDapi.getCreatedAt(),
      txHash: document?.txHash ?? null,
      data: JSON.stringify(documentFromDapi.getData()),
      typeName,
      transitionType: null
    }))
  }

  getDocumentsByDataContract = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc', type_name: typeName } = request.query

    const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, typeName, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }
}

module.exports = DocumentsController
