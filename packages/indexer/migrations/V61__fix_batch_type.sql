ALTER TABLE state_transitions
DROP COLUMN batch_type;


ALTER TABLE state_transitions
ADD COLUMN "batch_type" int DEFAULT NULL;