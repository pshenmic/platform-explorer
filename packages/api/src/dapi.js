const DAPIClient = require('@dashevo/dapi-client')
const {Identifier, DashPlatformProtocol} = require('@dashevo/wasm-dpp')

class DAPI {
    DAPIClient
    dpp

    constructor(options) {
        this.initDAPI(options)
        this.dpp = new DashPlatformProtocol()
    }

    initDAPI(options) {
        this.DAPIClient = new DAPIClient(options)
    }

    async getIdentityBalance(identifier) {
        const GRPCIdentity = await this.DAPIClient.platform.getIdentity(Identifier.from(identifier))
        return this.dpp.identity.createFromBuffer(GRPCIdentity.getIdentity()).balance
    }

    async getTotalCreditsInPlatform() {
        const {totalCreditsInPlatform} = await this.DAPIClient.platform.getTotalCreditsInPlatform()
        return totalCreditsInPlatform
    }
}

module.exports = DAPI
