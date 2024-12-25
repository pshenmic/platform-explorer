const DocumentsDAO = require('../dao/DocumentsDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const { decodeStateTransition } = require('../utils')
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

    const documentData = await this.documentsDAO.getDocumentByIdentifier(identifier)

    if (documentData) {
      return response.send(documentData)
    }

    if (!typeName || !contractId) {
      return response.status(404).send({ message: 'not found. Try to set type and data contract id' })
    }

    let dataContract

    if (contractId) {
      dataContract = await this.datacContractsDAO.getDataContractByIdentifier(contractId)
    }

    const [documentFromDapi] = await this.dapi.getDocuments(
      documentData?.type ?? typeName,
      {
        $format_version: '0',
        ownerId: documentData?.data_contract_owner.trim() ?? dataContract.owner,
        id: documentData?.data_contract_identifier.trim() ?? dataContract.identifier,
        version: documentData?.version ?? dataContract.version,
        documentSchemas: JSON.parse(documentData?.schema ?? dataContract.schema)
      },
      identifier,
      undefined,
      1
    )

    if (!documentFromDapi && !documentData) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(Document.fromObject({
      dataContractIdentifier: documentData?.data_contract_identifier ?? dataContract.identifier,
      deleted: documentData?.deleted ?? false,
      identifier: documentFromDapi?.getId() ?? documentData.identifier,
      isSystem: documentData?.isSystem ?? false,
      owner: documentFromDapi.getOwnerId(),
      revision: documentFromDapi.getRevision(),
      timestamp: documentFromDapi.getCreatedAt(),
      txHash: documentData?.txHash ?? null,
      data: JSON.stringify(documentFromDapi.getData()),
      typeName: documentData?.typeName ?? null,
      transitionType: documentData?.transitionType ?? null
    }))
  }

  getDocumentsByDataContract = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc', type } = request.query

    const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, type, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }
}

module.exports = DocumentsController
