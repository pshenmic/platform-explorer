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

    const [documentFromDapi] = await this.dapi.getDocuments(
      document?.type ?? typeName,
      {
        $format_version: '0',
        ownerId: document?.data_contract_owner.trim() ?? dataContract.owner,
        id: document?.data_contract_identifier.trim() ?? dataContract.identifier,
        version: document?.version ?? dataContract.version,
        documentSchemas: JSON.parse(document?.schema ?? dataContract.schema)
      },
      identifier,
      undefined,
      1
    )

    if (!documentFromDapi && !document) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(Document.fromObject({
      dataContractIdentifier: document?.data_contract_identifier ?? dataContract.identifier,
      deleted: document?.deleted ?? false,
      identifier: documentFromDapi?.getId() ?? document.identifier,
      isSystem: document?.isSystem ?? false,
      owner: documentFromDapi.getOwnerId(),
      revision: documentFromDapi.getRevision(),
      timestamp: documentFromDapi.getCreatedAt(),
      txHash: document?.txHash ?? null,
      data: JSON.stringify(documentFromDapi.getData()),
      typeName: document?.typeName ?? null,
      transitionType: document?.transitionType ?? null
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
