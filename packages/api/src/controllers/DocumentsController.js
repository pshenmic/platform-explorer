const DocumentsDAO = require('../dao/DocumentsDAO')
const { decodeStateTransition } = require('../utils')

class DocumentsController {
  constructor (client, knex, dapi) {
    this.documentsDAO = new DocumentsDAO(knex)
    this.client = client
    this.dapi = dapi
  }

  getDocumentByIdentifier = async (request, response) => {
    const { identifier } = request.params

    const documentData = await this.documentsDAO.getDocumentData(identifier)

    // second for system documents, like dash.dash alias
    if (!documentData || !documentData?.transition_data) {
      response.status(404).send({ message: 'not found' })
    }

    const { transitions } = await decodeStateTransition(this.client, documentData.transition_data)

    const decodedDocumentTransitionData = transitions.find(transition => transition.id === identifier)

    const [documentFromDapi] = await this.dapi.getDocuments(
      decodedDocumentTransitionData.type,
      {
        $format_version: '0',
        ownerId: documentData.data_contract_owner.trim(),
        id: documentData.data_contract_identifier.trim(),
        version: documentData.version,
        documentSchemas: documentData.schema
      },
      identifier,
      undefined,
      1
    )

    // TODO: Add system documents support
    // Currently only non system
    response.send({
      dataContractIdentifier: documentData.data_contract_identifier,
      deleted: documentData.deleted,
      identifier: documentFromDapi.getId(),
      isSystem: false,
      owner: documentData.owner.trim(),
      revision: documentFromDapi.getRevision(),
      timestamp: documentFromDapi.getCreatedAt(),
      txHash: documentData.hash,
      data: documentFromDapi.getData()
    })
  }

  getDocumentsByDataContract = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }
}

module.exports = DocumentsController
