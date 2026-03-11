const PlatformAddressesDAO = require("../dao/PlatformAddressesDAO");

module.exports = class PlatformAddressesController {
  constructor(knex, sdk) {
    this.platformAddressesDAO = new PlatformAddressesDAO(knex, sdk)
  }

  getPlatformAddressInfo = async (request, response) => {
    const {platform_address: platformAddress} = request.params

    const platformAddressInfo = await this.platformAddressesDAO.getPlatformAddressInfo(platformAddress)

    if(!platformAddressInfo) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(platformAddressInfo)
  }
}