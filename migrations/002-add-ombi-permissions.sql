-- Up
ALTER TABLE ombi ADD COLUMN username TEXT;

-- Down
ALTER TABLE ombi RENAME TO _ombi_old;
CREATE TABLE ombi
(
    id integer primary key asc,
    host text,
    port text,
    apikey text,
    requesttv text,
    requestmovie text
);

INSERT INTO ombi(id, host, port, apikey, requesttv, requestmovie)
    SELECT id, host, port, apikey, requesttv, requestmovie
    FROM _ombi_old;

DROP TABLE _ombi_old;
