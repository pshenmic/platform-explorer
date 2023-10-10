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

        response.send(Document.fromRow(document));
    }

    getDocumentsByDataContract = async (request, response) => {
        const {identifier} = request.params

        const documents = await this.documentsDAO.getDocumentsByDataContract(identifier)

        response.send(documents);
    }
}

module.exports = DocumentsController
