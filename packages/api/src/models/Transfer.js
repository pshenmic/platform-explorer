module.exports = class Transfer {
    id
    amount
    sender
    recipient
    timestamp

    constructor(amount, sender, recipient, timestamp) {
        this.amount = amount ?? null;
        this.sender = sender ? sender.trim() : null;
        this.recipient = recipient ? recipient.trim() : null;
        this.timestamp = timestamp ?? null;
    }

    static fromRow({amount, sender, recipient, timestamp}) {
        return new Transfer(amount, sender, recipient, timestamp)
    }
}
