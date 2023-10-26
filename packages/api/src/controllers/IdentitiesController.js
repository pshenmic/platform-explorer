const IdentitiesDAO = require("../dao/IdentitiesDAO");

class IdentitiesController {
    constructor(knex) {
        this.identitiesDAO = new IdentitiesDAO(knex)
    }

    getIdentityByIdentifier = async (request, response) => {
        const {identifier} = request.params;

        const identity = await this.identitiesDAO.getIdentityByIdentifier(identifier)

        if (!identity) {
            return response.status(404).send({message: 'not found'})
        }

        response.send(identity)
    }
}

module.exports = IdentitiesController
