const { deployContract } = require("./src/helpers/deploy-contract");
const { initClient } = require("./src/helpers/init-client")
const dotenv = require('dotenv')
dotenv.config()
function main() {
    const client = initClient();
    deployContract(client).catch(console.error);
}

main()