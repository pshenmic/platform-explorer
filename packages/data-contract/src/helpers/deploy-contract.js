const { schema } = require("../constants");
const { getId } = require("./get-id");

async function deployContract(client) {
    const id = await getId(client);
    const contract = await client.platform.contracts.create(schema, id);
    const deployedContract = await client.platform.contracts.publish(contract, id);
    console.log('All Done!');
    console.log(`Contract deployed at: ${deployedContract.getDataContract().getId(client)}`);
}

module.exports = { deployContract }