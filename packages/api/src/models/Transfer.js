module.exports = class Transfer {
    id
    amount
    sender
    recipient

    constructor(id, amount, sender, recipient) {
        this.id = id ?? null;
        this.amount = amount ?? null;
        this.sender = sender ?? null;
        this.recipient = recipient ?? null;
    }

    static fromRow({id, amount, sender, recipient}) {
        return new Transfer(id, amount, sender, recipient)
    }
}
