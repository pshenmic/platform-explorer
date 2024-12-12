const DocumentsDAO = require('../dao/DocumentsDAO')
const { DPNS_CONTRACT } = require('../constants')
const { default: convertToHomographSafeChars } = require('dash/build/utils/convertToHomographSafeChars')
const { buildIndexBuffer, getAliasInfo } = require('../utils')

class DocumentsController {
  constructor (knex, dapi) {
    this.documentsDAO = new DocumentsDAO(knex)
    this.dapi = dapi
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

  getContestedAliases = async (request, response) => {
    const { startResource, count, ascending } = request.query

    let normalizedResourceBuffer

    if (startResource) {
      normalizedResourceBuffer = buildIndexBuffer(convertToHomographSafeChars(startResource))
    }

    const { contestedResourceValuesList } = await this.dapi.getContestedResources(
      DPNS_CONTRACT,
      'domain',
      'parentNameAndLabel',
      [Buffer.from('\u0012\u0004dash')],
      undefined,
      startResource
        ? {
            startValue: normalizedResourceBuffer,
            startValueIncluded: true
          }
        : undefined,
      ascending,
      count
    )

    const aliasesInfo = (await Promise.all(contestedResourceValuesList.map(resource => {
      const utfAlias = Buffer.from(resource, 'base64').slice(2).toString()

      return getAliasInfo(`${utfAlias}.dash`, this.dapi)
    })))/// .map(info => ({}))

    // TODO: add non normalized names

    response.send(aliasesInfo)
  }
}

module.exports = DocumentsController
