ALTER TABLE identities ADD COLUMN "type" varchar(24) NOT NULL DEFAULT 'regular';

CREATE INDEX identities_type ON identities(type);
