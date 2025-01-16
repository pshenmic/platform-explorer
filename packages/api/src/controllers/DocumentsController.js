const DocumentsDAO = require('../dao/DocumentsDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const Document = require('../models/Document')

class DocumentsController {
  constructor (client, knex, dapi) {
    this.documentsDAO = new DocumentsDAO(knex, client)
    this.datacContractsDAO = new DataContractsDAO(knex)
    this.client = client
    this.dapi = dapi
  }

  getDocumentByIdentifier = async (request, response) => {
    const { identifier } = request.params
    const { document_type_name: documentTypeName, contract_id: contractId } = request.query

    const document = await this.documentsDAO.getDocumentByIdentifier(identifier)

    if (document) {
      return response.send(document)
    }

    if (!documentTypeName || !contractId) {
      return response.status(400).send({ message: 'Contract id and document type name not specified' })
    }

    let dataContract

    if (contractId) {
      dataContract = await this.datacContractsDAO.getDataContractByIdentifier(contractId)
    }

    if (!dataContract) {
      return response.status(400).send({ message: 'data contract not found' })
    }

    const [extendedDocument] = await this.dapi.getDocuments(
      documentTypeName,
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

    if (!extendedDocument) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(Document.fromObject({
      dataContractIdentifier: dataContract.identifier,
      deleted: false,
      identifier: extendedDocument?.getId().toString(),
      system: false,
      owner: extendedDocument.getOwnerId().toString(),
      revision: extendedDocument.getRevision(),
      timestamp: extendedDocument.getCreatedAt(),
      txHash: document?.txHash ?? null,
      data: JSON.stringify(extendedDocument.getData()),
      typeName: documentTypeName,
      transitionType: null
    }))
  }

  getDocumentsByDataContract = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc', document_type_name: documentTypeName } = request.query

    const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, documentTypeName, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }

  getContestedDocuments = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc', document_type_name: documentTypeName } = request.query

    const documents = await this.documentsDAO.getContestedDocuments(documentTypeName, Number(page ?? 1), Number(limit ?? 10), order)

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
