ALTER TABLE blocks
ADD COLUMN "timestamp" timestamp not null;

ALTER TABLE blocks
ADD COLUMN "created_at" timestamp default now();

ALTER TABLE blocks
ADD COLUMN "block_version" int not null;

ALTER TABLE blocks
ADD COLUMN "app_version" int not null;

ALTER TABLE blocks
ADD COLUMN "l1_locked_height" int not null;

ALTER TABLE blocks
ADD COLUMN "chain" varchar(64) not null;
