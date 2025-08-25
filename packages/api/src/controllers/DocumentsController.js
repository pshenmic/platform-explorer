const DocumentsDAO = require('../dao/DocumentsDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const Document = require('../models/Document')
const { IdentifierWASM } = require('pshenmic-dpp')

class DocumentsController {
  constructor (knex, sdk) {
    this.documentsDAO = new DocumentsDAO(knex, sdk)
    this.dataContractsDAO = new DataContractsDAO(knex, sdk)
    this.sdk = sdk
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
      dataContract = await this.dataContractsDAO.getDataContractByIdentifier(contractId)
    }

    if (!dataContract) {
      return response.status(400).send({ message: 'data contract not found' })
    }

    const [dapiDocument] = await this.dapi.getDocuments(
      documentTypeName,
      {
        $format_version: '0',
        ownerId: dataContract.owner.identifier,
        id: dataContract.identifier,
        version: dataContract.version,
        documentSchemas: JSON.parse(dataContract.schema)
      },
      [['$id', '=', new IdentifierWASM(identifier).base58()]],
      1
    )

    if (!dapiDocument) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(Document.fromObject({
      dataContractIdentifier: dataContract.identifier,
      deleted: false,
      identifier: dapiDocument?.id.base64(),
      system: false,
      owner: dapiDocument.ownerId.base58(),
      revision: dapiDocument.revision.toString(),
      timestamp: dapiDocument.createdAt.toString(),
      txHash: document?.txHash ?? null,
      data: JSON.stringify(dapiDocument.properties),
      typeName: documentTypeName,
      transitionType: null
    }))
  }

  getRawDocumentByIdentifier = async (request, response) => {
    const { identifier } = request.params
    const { document_type_name: documentTypeName, contract_id: contractId } = request.query

    let dataContract

    if (contractId) {
      dataContract = await this.dataContractsDAO.getDataContractByIdentifier(contractId)
    }

    if (!dataContract) {
      return response.status(404).send({ message: 'data contract not found' })
    }

    const [extendedDocument] = await this.dapi.getDocuments(
      documentTypeName,
      {
        $format_version: '0',
        ownerId: dataContract.owner.identifier,
        id: dataContract.identifier,
        version: dataContract.version,
        documentSchemas: JSON.parse(dataContract.schema)
      },
      [['$id', '=', new IdentifierWASM(identifier).base58()]],
      1,
      undefined,
      undefined,
      true
    )

    if (!extendedDocument) {
      return response.status(404).send({ message: 'document not found' })
    }

    response.send({ base64: extendedDocument.toString('base64') })
  }

  getDocumentsByDataContract = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc', document_type_name: documentTypeName } = request.query

    const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, documentTypeName, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }

  getDocumentRevisions = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const revisions = await this.documentsDAO.getDocumentRevisions(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(revisions)
  }
}

module.exports = DocumentsController
