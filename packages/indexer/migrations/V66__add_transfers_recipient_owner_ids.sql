ALTER TABLE transfers
ADD COLUMN "sender_id" int references identities(id);
ALTER TABLE transfers
ADD COLUMN "recipient_id" int references identities(id);

CREATE INDEX idx_sender_id ON transfers(sender_id);
CREATE INDEX idx_recipient_id ON transfers(recipient_id);
