const Document = require('../models/Document');
const DocumentsDAO = require('../dao/DocumentsDAO');

class DocumentsController {
    constructor(knex) {
        this.documentsDAO = new DocumentsDAO(knex)
    }

    getDocumentByIdentifier = async (request, response) => {
        const {identifier} = request.params

        const document = await this.documentsDAO.getDocumentByIdentifier(identifier)

        if (!document) {
            response.status(404).send({message: 'not found'})
        }

        response.send(document);
    }

    getDocumentsByDataContract = async (request, response) => {
        const {identifier} = request.params
        const {page = 1, limit = 10, order = 'asc'} = request.query

        if (order !== 'asc' && order !== 'desc') {
            return response.status(400).send({message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values`})
        }

        const documents = await this.documentsDAO.getDocumentsByDataContract(identifier, Number(page), Number(limit), order)

        response.send(documents);
    }
}

module.exports = DocumentsController
