const dotenv = require('dotenv')
dotenv.config()


const Dash = require('dash')

function logInfo(...messages) {
    console.log('\x1b[32m [INFO]', ...messages, '\x1b[0m ')
}

async function main() {
    logInfo('Client Initialization')
    
    const schema = {
        "labler": {
            "type": "object",
            "properties": {
                "contractId": {
                    "type": "string",
                    "minLength": 43,
                    "maxLength": 44,
                    "position": 0
                },
                "shortName": {
                    "type": "string",
                    "maxLength": 32,
                    "minLength": 3,
                    "position": 1.
                }
            },
            "required": [
                "shortName",
                "contractId"
            ],
            "additionalProperties": false
        }
    };

    let clientOpts = {
        network: 'testnet',
        wallet: {
            mnemonic: process.env.MNEMONIC,
            ...process.env.skipSynchronizationBeforeHeight && {
                unsafeOptions: {
                    skipSynchronizationBeforeHeight: Number(process.env.skipSynchronizationBeforeHeight),
                }
            }
        },
    };

    const client = new Dash.Client(clientOpts);

    logInfo('Contract Deployment')

    const identity = await client.platform.identities.get(process.env.OWNER_IDENTIFIER)

    const contract = await client.platform.contracts.create(schema, identity);
    const deployedContract = await client.platform.contracts.publish(contract, identity);

    logInfo('All Done!');
    logInfo(`Contract deployed at: ${deployedContract.getDataContract().getId(client)}`);
}

main().catch(console.error)