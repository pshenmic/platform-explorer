module.exports = class Transfer {
    id
    amount
    sender
    recipient
    timestamp

    constructor(id, amount, sender, recipient, timestamp) {
        this.id = id ?? null;
        this.amount = amount ?? null;
        this.sender = sender ?? null;
        this.recipient = recipient ?? null;
        this.timestamp = timestamp ?? null;
    }

    static fromRow({id, amount, sender, recipient, timestamp}) {
        return new Transfer(id, amount, sender, recipient, timestamp)
    }
}
