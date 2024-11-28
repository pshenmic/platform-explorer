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

    const stateTransitionData = await this.documentsDAO.getDocumentStateTransition(identifier)

    if (!stateTransitionData) {
      response.status(404).send({ message: 'not found' })
    }

    const { transitions } = await decodeStateTransition(this.client, stateTransitionData.data)

    const decodedDocumentTransitionData = transitions.find(transition => transition.id === identifier)

    const [documentFromDapi] = await this.dapi.getDocuments(
      decodedDocumentTransitionData.type,
      {
        $format_version: '0',
        ownerId: stateTransitionData.owner.trim(),
        id: stateTransitionData.identifier.trim(),
        version: stateTransitionData.version,
        documentSchemas: stateTransitionData.schema
      },
      identifier,
      undefined,
      1
    )

    response.send(documentFromDapi.getData())
  }

  getDocumentsByDataContract = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }
}

module.exports = DocumentsController
