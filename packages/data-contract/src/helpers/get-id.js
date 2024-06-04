async function getId(client) {
    if (process.env.ID && process.env.ID.toString().replace(' ', '') !== "") {
        return await client.platform.identities.get(process.env.ID);
    } else {
        const account = await client.getWalletAccount();
        const ids = await account.identities.getIdentityIds();

        console.log(`ID is not Set! \nUsing: ${ids[0]}`)
        
        return await client.platform.identities.get(ids[0]);
    }
}

module.exports = { getId }