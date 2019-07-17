-- Up
ALTER TABLE bot ADD COLUMN channelname TEXT;

-- Down
ALTER TABLE bot RENAME TO _bot_old;
CREATE TABLE bot
(   id integer primary key asc,
    token text,
    ownerid text,
    commandprefix text,
    deletecommandmessages text,
    unknowncommandresponse text
);
INSERT INTO bot (id, token, ownerid, commandprefix, deletecommandmessages, unknowncommandresponse)
    SELECT id, token, ownerid, commandprefix, deletecommandmessages, unknowncommandresponse
    FROM _bot_old;

DROP TABLE _bot_old;